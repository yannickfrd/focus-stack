<?php

declare(strict_types=1);

namespace App\Tests\Unit\Core\Application\UseCase\FocusTime;

use App\Core\Application\Request\FocusTime\CreateFocusTimeRequest;
use App\Core\Application\UseCase\FocusTime\CreateFocusTimeUseCase;
use App\Core\Domain\Entity\FocusTime\FocusTime;
use App\Core\Domain\Repository\FocusTime\FocusTimeRepositoryInterface;
use App\Core\Domain\Service\UuidGeneratorInterface;
use PHPUnit\Framework\TestCase;

final class CreateFocusTimeUseCaseTest extends TestCase
{
    private const string GENERATED_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    private const string TASK_UUID = 'b1ffcd00-0d1c-5fg9-cc7e-7cc0ce491b22';

    public function testExecuteCreatesAndSavesFocusTime(): void
    {
        $repository = $this->createMock(FocusTimeRepositoryInterface::class);
        $repository->expects($this->once())->method('save');

        $uuidGenerator = $this->createStub(UuidGeneratorInterface::class);
        $uuidGenerator->method('generate')->willReturn(self::GENERATED_UUID);

        $request = new CreateFocusTimeRequest(duration: 25, taskId: self::TASK_UUID);

        $useCase = new CreateFocusTimeUseCase($repository, $uuidGenerator);
        $focusTime = $useCase->execute(userId: 'user-1', request: $request);

        $this->assertInstanceOf(FocusTime::class, $focusTime);
        $this->assertSame(self::GENERATED_UUID, $focusTime->getId());
        $this->assertSame('user-1', $focusTime->getUserId());
        $this->assertSame(25, $focusTime->getDuration());
        $this->assertSame(self::TASK_UUID, $focusTime->getTaskId());
    }

    public function testExecuteCreatesWithoutTask(): void
    {
        $repository = $this->createMock(FocusTimeRepositoryInterface::class);
        $repository->expects($this->once())->method('save');

        $uuidGenerator = $this->createStub(UuidGeneratorInterface::class);
        $uuidGenerator->method('generate')->willReturn(self::GENERATED_UUID);

        $request = new CreateFocusTimeRequest(duration: 50, taskId: null);

        $useCase = new CreateFocusTimeUseCase($repository, $uuidGenerator);
        $focusTime = $useCase->execute('user-1', $request);

        $this->assertNull($focusTime->getTaskId());
        $this->assertSame(50, $focusTime->getDuration());
    }
}
