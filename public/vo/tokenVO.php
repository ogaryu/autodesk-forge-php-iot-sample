<?php
/**
 * 
 * User: Rain
 * Date: 14-6-14
 * Time: 下午6:56
 */

/**
 * Class TokenVO
 *
 * {
 *   "access_token": "47cRGdozbOd80IqiIV01YQhNaK4n",
 *   "expires_in": 899,
 *   "token_type": "Bearer"
 *   }
 */
class TokenVO
{
    var $access_token;
    var $expires_in;
    var $token_type;
    var $init_time;

    public function __construct($a , $e , $t)
    {
        $this->access_token = $a;
        $this->expires_in = $e;
        $this->token_type = $t;

        $this->init_time = time();
    }

    public function isExpired()
    {
        if(time() - $this->init_time > $this->expires_in)
        {
            return true; //过期
        }
        return false;
    }
}