<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\Task;

enum ScheduledFor: string
{
    case Today = 'today';
    case Tomorrow = 'tomorrow';

    /** @return string[] */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
