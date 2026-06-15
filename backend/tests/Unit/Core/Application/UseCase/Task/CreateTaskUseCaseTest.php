<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\Task;

use App\Core\Application\UseCase\Task\CreateTaskUseCase;
use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Repository\Task\TaskRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class CreateTaskUseCaseTest extends TestCase
{
    public function testExecuteCreatesAndSavesTask(): void
    {
        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->method('countByUserId')->willReturn(2);
        $repository->expects($this->once())->method('save')
            ->willReturnCallback(function (Task $task): void {
                $task->setId(1);
            });

        $useCase = new CreateTaskUseCase($repository);
        $task = $useCase->execute(
            userId: 'user-1',
            title: 'Test Task',
            description: 'Desc',
            priority: Priority::High,
            scheduledFor: ScheduledFor::Today,
            estimatedTime: '30min',
        );

        $this->assertInstanceOf(Task::class, $task);
        $this->assertSame(1, $task->getId());
        $this->assertSame('Test Task', $task->getTitle());
        $this->assertSame('user-1', $task->getUserId());
        $this->assertSame(2, $task->getPosition());
    }

    public function testExecuteUsesRepositoryCountForPosition(): void
    {
        $repository = $this->createMock(TaskRepositoryInterface::class);
        $repository->expects($this->once())->method('countByUserId')->with('user-1')->willReturn(5);
        $repository->method('save')->willReturnCallback(function (Task $task): void {
            $task->setId(10);
        });

        $useCase = new CreateTaskUseCase($repository);
        $task = $useCase->execute('user-1', 'Task', null, Priority::Middle, null, null);

        $this->assertSame(5, $task->getPosition());
    }
}
