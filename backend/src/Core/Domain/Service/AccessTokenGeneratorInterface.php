<?php

declare(strict_types=1);

namespace App\Core\Domain\Service;

interface AccessTokenGeneratorInterface
{
    public function generate(string $userIdentifier): string;
}
