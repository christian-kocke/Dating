<?php namespace Api\Facades;
 
use Illuminate\Support\Facades\Facade;
 
class InvitationFacade extends Facade {
 
    protected static function getFacadeAccessor()
    {
        return new \Api\Services\Invitation;
    }
 
}