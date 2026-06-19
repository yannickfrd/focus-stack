<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Domain\FocusTime;

use App\Core\Domain\Entity\FocusTime\FocusTime;
use PHPUnit\Framework\TestCase;

final class FocusTimeTest extends TestCase
{
    private const string UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    private const string TASK_UUID = 'b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22';

    public function testCreateSetsPropertiesCorrectly(): void
    {
        $focusTime = FocusTime::create(
            id: self::UUID,
            userId: 'user-uuid',
            duration: 25,
            taskId: self::TASK_UUID,
        );

        $this->assertSame(self::UUID, $focusTime->getId());
        $this->assertSame('user-uuid', $focusTime->getUserId());
        $this->assertSame(25, $focusTime->getDuration());
        $this->assertSame(self::TASK_UUID, $focusTime->getTaskId());
        $this->assertInstanceOf(\DateTimeImmutable::class, $focusTime->getCompletedAt());
    }

    public function testCreateWithoutTaskId(): void
    {
        $focusTime = FocusTime::create(id: self::UUID, userId: 'user-1', duration: 50);

        $this->assertNull($focusTime->getTaskId());
    }

    public function testSetCompletedAtOverridesDefault(): void
    {
        $completedAt = new \DateTimeImmutable('2026-01-01T10:00:00Z');
        $focusTime = FocusTime::create(self::UUID, 'user-1', 25)->setCompletedAt($completedAt);

        $this->assertSame($completedAt, $focusTime->getCompletedAt());
    }
}
