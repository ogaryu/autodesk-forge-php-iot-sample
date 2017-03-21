<?php
/**
 * 
 * User: Rain
 * Date: 14-6-14
 * Time: 下午8:29
 */

class UpReponseVO
{
    var $location;
    var $size;
    var $bucket_key; //bucket name
    var $key; //file name
    var $id;  //urn
    var $sha;
    var $content_type;

    public function __construct($l, $s, $bk, $key ,$id, $sha, $ct)
    {
        $this->bucket_key = $bk;
        $this->key = $key;
        $this->location = $l;
        $this->size = $s;
        $this->id = base64_encode($id);
        $this->sha = $sha;
        $this->content_type = $ct;
    }
}