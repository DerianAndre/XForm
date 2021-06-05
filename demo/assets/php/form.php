<?php
  /*!
  * XForm
  * A simple and automated way to manage forms with objects and XMLHttpRequest.
  * @version    : 1.0.0
  * @author     : DerianAndre <hola@derianandre.com>
  * @repository : https://github.com/Xolvex/Xolvex-Form.git
  * @built      : 4/6/2021
  * @license    : MIT
  */

  $response = "error";
  $post = false;

  if(!empty($_POST)) {
    // Response
    $response = 'success';
  }

  var_dump($_POST);
  var_dump($_FILES);
  echo "\n";
  echo $response;

?>
