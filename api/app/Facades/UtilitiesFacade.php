<?php namespace Api\Facades;
 
use Illuminate\Support\Facades\Facade;
 
class UtilitiesFacade extends Facade {
 
    protected static function getFacadeAccessor()
    {
        return new \Api\Services\Utilities;
    }
 
}