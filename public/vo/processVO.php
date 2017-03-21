<?php
/**
 * 
 * User: Rain
 * Date: 14-6-14
 * Time: 下午8:32
 */

class ProcessVO
{
    var $status;  //complete
    var $progress; //百分比

    public function __construct($s,$s2)
    {
        $this->status = $s;
        $this->progress = $s2;
    }

}