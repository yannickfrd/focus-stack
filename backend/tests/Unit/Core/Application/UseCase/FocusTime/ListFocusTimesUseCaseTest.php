<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\FocusTime;

use App\Core\Application\UseCase\FocusTime\ListFocusTimesUseCase;
use App\Core\Domain\Entity\FocusTime\FocusTime;
use App\Core\Domain\Repository\FocusTime\FocusTimeRepositoryInterface;
use PHPUnit\Framework\TestCase;

final class ListFocusTimesUseCaseTest extends TestCase
{
    public function testExecuteReturnsFocusTimesFromRepository(): void
    {
        $focusTimes = [
            FocusTime::create('user-1', 25),
            FocusTime::create('user-1', 50),
        ];

        $repository = $this->createStub(FocusTimeRepositoryInterface::class);
        $repository->method('findAllByUserId')->willReturn($focusTimes);

        $useCase = new ListFocusTimesUseCase($repository);
        $result = $useCase->execute('user-1');

        $this->assertCount(2, $result);
        $this->assertSame($focusTimes, $result);
    }

    public function testExecuteReturnsEmptyArrayWhenNoFocusTimes(): void
    {
        $repository = $this->createStub(FocusTimeRepositoryInterface::class);
        $repository->method('findAllByUserId')->willReturn([]);

        $useCase = new ListFocusTimesUseCase($repository);
        $result = $useCase->execute('user-1');

        $this->assertSame([], $result);
    }
}
