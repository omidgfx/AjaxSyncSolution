<?php

require_once "SyncHelper.php";
$quotes = [
    1  => [
        'text' => "It's not the size of the dog in the fight, but the size of the fight in the dog.",
        'name' => "Archie Griffen",
    ],
    2  => [
        'text' => "Nothing lasts forever. Not even your troubles.",
        'name' => "Arnold H Glasgow",
    ],
    3  => [
        'text' => "There are only two ways to live your life. One is as though nothing is a miracle. The other is as though everything is a miracle",
        'name' => "Albert Einstein",
    ],
    4  => [
        'text' => "Take chances, make mistakes. That's how you grow. Pain nourishes your courage. You have to fail in order to practice being brave.",
        'name' => "Mary Tyler Moore",
    ],
    5  => [
        'text' => "Being strong means rejoicing in who you are, complete with imperfections.",
        'name' => "Margaret Woodhouse",
    ],
    6  => [
        'text' => "If you don’t go after what you want, you’ll never have it. If you don’t ask, the answer is always no. If you don’t step forward, you’re always in the same place.",
        'name' => "Nora Roberts",
    ],
    7  => [
        'text' => "I've missed more than 9,000 shots in my career. I've lost almost 300 games. Twenty-six times I've been trusted to take the game-winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.",
        'name' => "Michael Jordan",
    ],
    8  => [
        'text' => "The only place you find success before work is in the dictionary.",
        'name' => "May V Smith",
    ],
    9  => [
        'text' => "You're going to fail your way to success, you have nothing to be ashamed of so keep your head up. It’s much easier to come up with excuses of why you can't do it. If you do what is easy your life will be hard.",
        'name' => "Les Brown",
    ],
    10 => [
        'text' => "A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing.",
        'name' => "George Bernard Shaw",
    ],
    11 => [
        'text' => "Nobody can make you feel inferior without your consent.",
        'name' => "Eleanor Roosevelt",
    ],
    12 => [
        'text' => "It took me a long time not to judge myself through someone else's eyes.",
        'name' => "Sally Field",
    ],
    13 => [
        'text' => "I quit being afraid when my first venture failed and the sky didn't fall down.",
        'name' => "Allen H Neuharth",
    ],
    14 => [
        'text' => "Hope never abandons you, you abandon it.",
        'name' => "George Weinberg",
    ],
    15 => [
        'text' => "The only thing keeping you from getting what you want is the story you keep telling yourself about why you don't have it. People who are willing to die to succeed will tend to succeed.",
        'name' => "Tony Robbins",
    ],
    16 => [
        'text' => "People are like stained-glass windows. They sparkle and shine when the sun is out, but when the darkness sets in their true beauty is revealed only if there is light from within. ",
        'name' => "Elisabeth Kübler-Ross",
    ],
    17 => [
        'text' => "Nothing splendid has ever been achieved except by those who dared believe that something inside of them was superior to circumstance.",
        'name' => "Bruce Barton",
    ],
    18 => [
        'text' => "Aerodynamically the bumblebee shouldn't be able to fly, but the bumblebee doesn't know that so it goes on flying anyway.",
        'name' => "Mary Kay Ash",
    ],
    19 => [
        'text' => "The secret is in not giving up, of all the greats they didn't quit. If you quit I guarantee you're gonna fail, but you don't know what's gunna happen if you don't give in.",
        'name' => "Eric Thomas",
    ],
    20 => [
        'text' => "Just decide; what's it's gonna be, who you're gonna be and how your gonna do it, and then from that point, the universe will get out of your way.",
        'name' => "Will Smith",
    ],
];

$helper = new \Sync\Helper();
$helper->listen('quote_service', function($request) {
    global $quotes;
    $response = [];
    if(key_exists('random_quote', $request)) {
        $number            = intval($request['random_quote']);
        $response['quote'] = [
            'number' => $number,
            'text'   => $quotes[ $number ]['text'],
            'name'   => $quotes[ $number ]['name'],
        ];
    } else throw new \Sync\ServiceException('Invalid Number');

    return $response;
});
$helper->perform();