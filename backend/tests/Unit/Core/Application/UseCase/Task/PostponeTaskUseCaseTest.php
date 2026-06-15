<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\UseCase\Task\PostponeTaskUseCase;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Exception\NotFoundException;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class PostponeTaskUseCaseTest extends TestCase
{
    public function testExecuteSetsScheduledForToTomorrow(): void
    {
        $task = Task::create('Task', 'user-1', null, scheduledFor: ScheduledFor::Today);
        $task->setId(1);

        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->with(1, 'user-1')->willReturn($task);
        $repository->expects($this->once())->method('save')->with($task);

        $useCase = new PostponeTaskUseCase($repository);
        $result = $useCase->execute(1, 'user-1');

        $this->assertSame(ScheduledFor::Tomorrow, $result->getScheduledFor());
    }

    public function testExecuteThrowsWhenTaskNotFound(): void
    {
        $repository = $this->createStub(TaskRepositoryInterface::class);
        $repository->method('findByIdAndUserId')->willReturn(null);

        $this->expectException(NotFoundException::class);

        $useCase = new PostponeTaskUseCase($repository);
        $useCase->execute(99, 'user-1');
    }
}
