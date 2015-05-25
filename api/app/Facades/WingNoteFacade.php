<?php namespace Api\Facades;
 
use Illuminate\Support\Facades\Facade;
 
class WingNoteFacade extends Facade {
 
    protected static function getFacadeAccessor()
    {
        return new \Api\Services\WingNote;
    }
 
}