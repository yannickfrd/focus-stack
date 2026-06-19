<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\FocusTime;

use App\Core\Application\Request\FocusTime\CreateFocusTimeRequest;
use App\Core\Application\UseCase\FocusTime\CreateFocusTimeUseCase;
use App\Core\Domain\Entity\FocusTime\FocusTime;
use App\Core\Domain\Repository\FocusTime\FocusTimeRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class CreateFocusTimeUseCaseTest extends TestCase
{
    public function testExecuteCreatesAndSavesFocusTime(): void
    {
        $repository = $this->createMock(FocusTimeRepositoryInterface::class);
        $repository->expects($this->once())->method('save')
            ->willReturnCallback(function (FocusTime $focusTime): void {
                $focusTime->setId(1);
            });

        $request = new CreateFocusTimeRequest(duration: 25, taskId: 10);

        $useCase = new CreateFocusTimeUseCase($repository);
        $focusTime = $useCase->execute(userId: 'user-1', request: $request);

        $this->assertInstanceOf(FocusTime::class, $focusTime);
        $this->assertSame(1, $focusTime->getId());
        $this->assertSame('user-1', $focusTime->getUserId());
        $this->assertSame(25, $focusTime->getDuration());
        $this->assertSame(10, $focusTime->getTaskId());
    }

    public function testExecuteCreatesWithoutTask(): void
    {
        $repository = $this->createMock(FocusTimeRepositoryInterface::class);
        $repository->expects($this->once())->method('save')
            ->willReturnCallback(function (FocusTime $focusTime): void {
                $focusTime->setId(2);
            });

        $request = new CreateFocusTimeRequest(duration: 50, taskId: null);

        $useCase = new CreateFocusTimeUseCase($repository);
        $focusTime = $useCase->execute('user-1', $request);

        $this->assertNull($focusTime->getTaskId());
        $this->assertSame(50, $focusTime->getDuration());
    }
}
