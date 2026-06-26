<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Domain\Task;

use App\Core\Domain\Entity\Task\Priority;
use App\Core\Domain\Entity\Task\ScheduledFor;
use App\Core\Domain\Entity\Task\Task;
use PHPUnit\Framework\TestCase;

final class TaskTest extends TestCase
{
    public function testCreateSetsPropertiesCorrectly(): void
    {
        $task = Task::create(
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            title: 'My Task',
            userId: 'user-uuid',
            description: 'A description',
            priority: Priority::High,
            scheduledFor: ScheduledFor::Today,
            estimatedTime: '2h',
            position: 3,
        );

        $this->assertSame('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', $task->getId());
        $this->assertSame('My Task', $task->getTitle());
        $this->assertSame('user-uuid', $task->getUserId());
        $this->assertSame('A description', $task->getDescription());
        $this->assertSame(Priority::High, $task->getPriority());
        $this->assertFalse($task->isDone());
        $this->assertSame(ScheduledFor::Today, $task->getScheduledFor());
        $this->assertSame('2h', $task->getEstimatedTime());
        $this->assertSame(3, $task->getPosition());
        $this->assertInstanceOf(\DateTimeImmutable::class, $task->getCreatedAt());
    }

    public function testCreateUsesDefaults(): void
    {
        $task = Task::create(id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', title: 'Minimal', userId: 'user-1');

        $this->assertSame(Priority::Middle, $task->getPriority());
        $this->assertSame(ScheduledFor::Today, $task->getScheduledFor());
        $this->assertNull($task->getDescription());
        $this->assertNull($task->getEstimatedTime());
        $this->assertSame(0, $task->getPosition());
        $this->assertFalse($task->isDone());
    }

    public function testSetDoneTogglesBooleanState(): void
    {
        $task = Task::create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Task', 'user-1');
        $this->assertFalse($task->isDone());

        $task->setDone(true);
        $this->assertTrue($task->isDone());

        $task->setDone(false);
        $this->assertFalse($task->isDone());
    }

    public function testSetScheduledForChangesValue(): void
    {
        $task = Task::create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Task', 'user-1');
        $task->setScheduledFor(ScheduledFor::Tomorrow);

        $this->assertSame(ScheduledFor::Tomorrow, $task->getScheduledFor());
    }

    public function testSetCreatedAtOverridesDefault(): void
    {
        $createdAt = new \DateTimeImmutable('2024-01-01');
        $task = Task::create('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Task', 'user-1')->setCreatedAt($createdAt);

        $this->assertSame($createdAt, $task->getCreatedAt());
    }
}
