<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Domain\Task;

use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\Task;
use App\Core\Domain\Entity\Task\TaskList;
use App\Core\Domain\Exception\NotFoundException;
use PHPUnit\Framework\TestCase;

final class TaskListTest extends TestCase
{
    private const string UUID1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    private const string UUID2 = 'b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22';
    private const string UUID3 = 'c2ggde11-1e2d-6gh0-dd8f-8dd1df502c33';

    public function testTasksReturnsAllTasks(): void
    {
        $task1 = $this->makeTask(self::UUID1, 0);
        $task2 = $this->makeTask(self::UUID2, 1);

        $taskList = new TaskList([$task1, $task2]);

        $this->assertSame([$task1, $task2], $taskList->tasks());
    }

    public function testReorderUpdatesPositions(): void
    {
        $task1 = $this->makeTask(self::UUID1, 0);
        $task2 = $this->makeTask(self::UUID2, 1);
        $task3 = $this->makeTask(self::UUID3, 2);

        $taskList = new TaskList([$task1, $task2, $task3]);
        $taskList->reorder([self::UUID3, self::UUID1, self::UUID2]);

        $this->assertSame(1, $task1->getPosition());
        $this->assertSame(2, $task2->getPosition());
        $this->assertSame(0, $task3->getPosition());
    }

    public function testReorderThrowsWhenIdNotFound(): void
    {
        $task = $this->makeTask(self::UUID1, 0);
        $taskList = new TaskList([$task]);

        $this->expectException(NotFoundException::class);

        $taskList->reorder([self::UUID1, '00000000-0000-0000-0000-000000000099']);
    }

    private function makeTask(string $id, int $position): Task
    {
        return Task::create(id: $id, title: 'Task', userId: 'user-1', priority: Priority::Middle)
            ->setPosition($position);
    }
}
