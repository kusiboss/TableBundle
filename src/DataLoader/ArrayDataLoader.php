<?php

declare(strict_types=1);

namespace araise\TableBundle\DataLoader;

use araise\TableBundle\Extension\PaginationExtension;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ArrayDataLoader extends AbstractDataLoader
{
    public const OPT_DATA = 'data';

    protected PaginationExtension $paginationExtension;

    public function loadNecessaryExtensions(iterable $extensions): void
    {
        foreach ($extensions as $extension) {
            if ($extension instanceof PaginationExtension) {
                $this->paginationExtension = $extension;
                break;
            }
        }
    }

    public function getResults(): iterable
    {
        $this->paginationExtension->setTotalResults(count($this->options[self::OPT_DATA]));
        $data = $this->options[self::OPT_DATA]->toArray();
        $data = array_splice(
            $data,
            $this->paginationExtension->getOffsetResults(),
            $this->paginationExtension->getLimit()
        );
        return new ArrayCollection($data);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setRequired(self::OPT_DATA);
        $resolver->setAllowedTypes(self::OPT_DATA, ['iterable']);
    }
}
