<?php
require_once '../src/php/SyncHelper.php';

$syncHelper = new Sync\Helper;

$syncHelper->listen('friends', function($requests) {
    if(rand(0, 50) == 25) throw new \Sync\SyncException('`friends` service listener in back-end: Just a fake random error that causes failedSync. It will execute `failedSync` of  all services.');
    if(rand(0, 10) == 5) throw new \Sync\ServiceException('Just a fake random error.', rand(1, 500) * -1);
    $resp = [];
    if($requests) foreach($requests as $request)
        $resp[ $request ] = rand(0, 1) == 0 ? FALSE : TRUE;

    return $resp;
});
$syncHelper->listen('notifications', function($requests) {
    if(rand(0, 50) == 25) throw new \Sync\SyncException('`notifications` service listener in back-end: Just a fake random error that causes failedSync. It will execute `failedSync` of  all services.');
    if(rand(0, 10) == 5) throw new \Sync\ServiceException('Just a fake random error.', rand(1, 500) * -1);
    $resp = [];
    if($requests) foreach($requests as $request) {
        $n = 0;
        if(rand(1, 4) != 1)
            $n = rand(0, 180);
        $resp[ $request ] = $n;
    }

    return $resp;
});
$syncHelper->listen('statistics', function($requests) {
    if(rand(0, 50) == 25) throw new \Sync\SyncException('`statistics` service listener in back-end: Just a fake random error that causes failedSync. It will execute `failedSync` of  all services.');
    if(rand(0, 10) == 5) throw new \Sync\ServiceException('Just a fake random error.', rand(1, 500) * -1);
    $randomBar = function($number) {
        $number = $number < 10 ? "0$number" : $number;
        $c1     = rand(40, 255);
        $c2     = rand(40, 255);
        $c3     = rand(40, 255);

        return [
            'name'       => "Bar $number",
            'color'      => "rgb($c1,$c2,$c3)",
            'percentage' => rand(0, 100),
        ];
    };
    $chartBars = [];
    for($b = 1; $b <= 12; $b++)
        $chartBars[] = $randomBar($b);
    // polygon
    $pPointCounts = rand(3, 8);
    $polygon      = [
        'anchors'   => [],
        'fillColor' => [
            'r' => rand(20, 180),
            'g' => rand(20, 180),
            'b' => rand(20, 180),
        ],
    ];

    for($p = 0; $p < $pPointCounts; $p++)
        $polygon['anchors'][] = ['x' => rand(0, 150), 'y' => rand(0, 150)];

    return [
        'population' => number_format(rand(1200000, 18000000), 0, '.', ','),
        'chartBars'  => $chartBars,
        'polygon'    => $polygon,
    ];
});

$syncHelper->perform();