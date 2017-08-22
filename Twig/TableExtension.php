<?php
/*
 * Copyright (c) 2016, whatwedo GmbH
 * All rights reserved
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

namespace whatwedo\TableBundle\Twig;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;

/**
 * @author Ueli Banholzer <ueli@whatwedo.ch>
 */
class TableExtension extends \Twig_Extension
{
    /**
     * @var ContainerInterface
     */
    protected $container;

    /**
     * @var Request
     */
    protected $request;

    /**
     * @var RouterInterface
     */
    protected $router;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
        $this->router = $container->get('router');
        $this->request = $container->get('request_stack')->getMasterRequest();
    }

    /**
     * @inheritdoc
     */
    public function getFunctions()
    {
        return [
            /**
             * returns an instance of Table
             */
            new \Twig_SimpleFunction('whatwedo_table', function($identifier, $options) {
                $tableFactory = $this->container->get('whatwedo_table.factory.table');
                return call_user_func([$tableFactory, 'createTable'], $identifier, $options);
            }),
            /**
             * returns an instance of DoctrineTable
             */
            new \Twig_SimpleFunction('whatwedo_doctrine_table', function($identifier, $options) {
                $tableFactory = $this->container->get('whatwedo_table.factory.table');

                return call_user_func([$tableFactory, 'createDoctrineTable'], $identifier, $options);
            }),
            /**
             * generates the same route with replaced or new arguments
             */
            new \Twig_SimpleFunction('whatwedo_table_generate_route_replace_arguments', function($arguments) {
                $parameters = array_replace(
                    $this->request->query->all(),
                    $arguments
                );

                return $this->router->generate(
                    $this->request->attributes->get('_route'),
                    $parameters
                );

            })
        ];
    }

    /**
     * @inheritdoc
     */
    public function getName()
    {
        return 'whatwedo_table_table_extension';
    }
}
