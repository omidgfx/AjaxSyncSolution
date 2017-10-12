<?php
//  Copyright 2017 Pejman Chatrrooz
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

namespace Sync;

use Throwable;

class Helper {
    /** @var callable[] $services */
    private $services  = [];
    private $performed = FALSE;

    /**
     * using a {@see callbackCallable()}.
     *
     * @param $dataKey
     * @param callable $callback A non-null {@see callbackCallable()}.
     */
    public function listen($dataKey, callable $callback) {
        $this->services[ $dataKey ] = $callback;
    }

    /**
     * Used by {@see on()}.
     *
     * @param array $parameters
     * @param bool $exists
     *
     * @return bool
     * @see listen()
     * @throws \Exception This is a prototype; not meant to be called directly.
     */
    private static function callbackCallable($parameters, $exists) {
        throw new \Exception("callbackCallable prototype called");

    }

    /**
     * @param bool $printResponse
     *
     * @return array
     * @throws SyncException
     */
    public function perform($printResponse = TRUE) {
        if($this->performed) throw new SyncException('Sync\Helper::perform(); should be executed only once after all service listeners');
        $resp = [];
        foreach($this->services as $dataKey => $callable) {
            if(key_exists($dataKey, $_REQUEST)) {
                try {
//                    if(!key_exists('_ok', $resp)) $resp['_ok'] = [];
                    $resp['_ok'][ $dataKey ] = $callable($_REQUEST[ $dataKey ]);
                } catch(ServiceException $e) {
                    if(!key_exists('_er', $resp)) $resp['_er'] = [];
                    $resp['_er'][ $dataKey ] = ['responseText' => $e->getMessage(), 'status' => $e->getCode()];
                } catch(SyncException $e) {
                    http_response_code($e->getCode());
                    die($e->getMessage());
                } catch(\Exception $e) {
                    http_response_code(500);
                    die($e->getMessage());
                }
            }
        }
        if($printResponse) {
            $s = json_encode($resp);
            header("Pragma: no-cache");
            header("Cache-Control: no-cache, must-revalidate");
            header("Keep-Alive: timeout=5, max=100");
            header("Content-Type: application/json");
            header("Content-Length: " . strlen($s));
            echo $s;
        }

        return $resp;
    }
}

class SyncException extends \Exception {
    public function __construct($message = "", $code = 500, Throwable $previous = NULL) {
        if(!is_int($code) || $code > 599 || $code < 400) $code = 500;
        parent::__construct($message, $code, $previous);
    }
}

class ServiceException extends \Exception {
    public function __construct($message = "", $code = NULL, Throwable $previous = NULL) {
        parent::__construct($message, $code, $previous);
    }
}