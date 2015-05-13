<?php namespace Api\Facades;
 
use Illuminate\Support\Facades\Facade;
 
class ImageFacade extends Facade {
 
    protected static function getFacadeAccessor()
    {
        return new \Api\Services\Image;
    }
 
}