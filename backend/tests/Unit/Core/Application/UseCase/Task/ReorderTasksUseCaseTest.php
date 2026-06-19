<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\UseCase\Task\ReorderTasksUseCase;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class ReorderTasksUseCaseTest extends TestCase
{
    private const string UUID1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    private const string UUID2 = 'b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22';
    private const string UUID3 = 'c2ggde11-1e2d-6gh0-dd8f-8dd1df502c33';

    public function testExecuteUpdatesPositionsAndSavesAll(): void
    {
        $task1 = Task::create(self::UUID1, 'A', 'user-1')->setPosition(0);
        $task2 = Task::create(self::UUID2, 'B', 'user-1')->setPosition(1);
        $task3 = Task::create(self::UUID3, 'C', 'user-1')->setPosition(2);

        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('findAllByUserId')->with('user-1')->willReturn([$task1, $task2, $task3]);
        $repository->expects($this->once())->method('saveAll');

        $useCase = new ReorderTasksUseCase($repository);
        $useCase->execute([self::UUID3, self::UUID1, self::UUID2], 'user-1');

        $this->assertSame(0, $task3->getPosition());
        $this->assertSame(1, $task1->getPosition());
        $this->assertSame(2, $task2->getPosition());
    }

    public function testExecuteThrowsWhenIdNotFoundForUser(): void
    {
        $task = Task::create(self::UUID1, 'A', 'user-1');

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findAllByUserId')->willReturn([$task]);

        $this->expectException(NotFoundException::class);

        $useCase = new ReorderTasksUseCase($repository);
        $useCase->execute([self::UUID1, '00000000-0000-0000-0000-000000000099'], 'user-1');
    }
}
