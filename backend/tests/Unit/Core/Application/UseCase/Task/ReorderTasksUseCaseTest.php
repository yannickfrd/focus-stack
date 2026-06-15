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
    public function testExecuteUpdatesPositionsAndSavesAll(): void
    {
        $task1 = Task::create('A', 'user-1');
        $task1->setId(1)->setPosition(0);

        $task2 = Task::create('B', 'user-1');
        $task2->setId(2)->setPosition(1);

        $task3 = Task::create('C', 'user-1');
        $task3->setId(3)->setPosition(2);

        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('findAllByUserId')->with('user-1')->willReturn([$task1, $task2, $task3]);
        $repository->expects($this->once())->method('saveAll');

        $useCase = new ReorderTasksUseCase($repository);
        $useCase->execute([3, 1, 2], 'user-1');

        $this->assertSame(0, $task3->getPosition());
        $this->assertSame(1, $task1->getPosition());
        $this->assertSame(2, $task2->getPosition());
    }

    public function testExecuteThrowsWhenIdNotFoundForUser(): void
    {
        $task = Task::create('A', 'user-1');
        $task->setId(1);

        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findAllByUserId')->willReturn([$task]);

        $this->expectException(NotFoundException::class);

        $useCase = new ReorderTasksUseCase($repository);
        $useCase->execute([1, 99], 'user-1');
    }
}
