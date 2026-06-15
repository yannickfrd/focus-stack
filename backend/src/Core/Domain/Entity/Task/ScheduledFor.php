<?php

declare(strict_types=1);

namespace App\Core\Domain\Entity\Task;

enum ScheduledFor: string
{
    case Today = 'today';
    case Tomorrow = 'tomorrow';
}
