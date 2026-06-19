<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Domain\FocusTime;

use App\Core\Domain\Entity\FocusTime\FocusTime;
use PHPUnit\Framework\TestCase;

final class FocusTimeTest extends TestCase
{
    public function testCreateSetsPropertiesCorrectly(): void
    {
        $focusTime = FocusTime::create(
            userId: 'user-uuid',
            duration: 25,
            taskId: 42,
        );

        $this->assertNull($focusTime->getId());
        $this->assertSame('user-uuid', $focusTime->getUserId());
        $this->assertSame(25, $focusTime->getDuration());
        $this->assertSame(42, $focusTime->getTaskId());
        $this->assertInstanceOf(\DateTimeImmutable::class, $focusTime->getCompletedAt());
    }

    public function testCreateWithoutTaskId(): void
    {
        $focusTime = FocusTime::create(userId: 'user-1', duration: 50);

        $this->assertNull($focusTime->getTaskId());
    }

    public function testSetIdAssignsId(): void
    {
        $focusTime = FocusTime::create('user-1', 25);
        $focusTime->setId(7);

        $this->assertSame(7, $focusTime->getId());
    }

    public function testSetCompletedAtOverridesDefault(): void
    {
        $completedAt = new \DateTimeImmutable('2026-01-01T10:00:00Z');
        $focusTime = FocusTime::create('user-1', 25)->setCompletedAt($completedAt);

        $this->assertSame($completedAt, $focusTime->getCompletedAt());
    }
}
