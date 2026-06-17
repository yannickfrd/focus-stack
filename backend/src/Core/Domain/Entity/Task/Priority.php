<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\Task;

enum Priority: string
{
    case High = 'high';
    case Middle = 'middle';
    case Low = 'low';

    /** @return string[] */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
