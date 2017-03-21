<?php
/**
 * 
 *{
 *"createDate": 1402745678124,
 *"key": "bucket1",
 *"owner": "XHDrQl3cq8KL2bbZFOkGXMGfxywsScvH",
 *"permissions": [
 *{
 *"access": "full",
 * "serviceId": "XHDrQl3cq8KL2bbZFOkGXMGfxywsScvH"
 *}
 *],
 *"policyKey": "transient"
}
 */

class bucketVO
{
    var $createDate;
    var $key;
    var $owner;
    var $access;
    var $serviceId;
    var $policyKey;

    public function __construct($cd , $key , $owner , $access , $serviceId , $policyKey)
    {
        $this->createDate = $cd;
        $this->key = $key;
        $this->owner = $owner;
        $this->access = $access;
        $this->serviceId = $serviceId;
        $this->policyKey = $policyKey;
    }
}