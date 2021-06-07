<?php
  /*!
  * XForm
  * A simple and automated way to manage forms with objects and XMLHttpRequest.
  * @version    : 1.0.0
  * @author     : DerianAndre <hola@derianandre.com>
  * @repository : https://github.com/DerianAndre/XForm.git
  * @license    : MIT
  */
  // Optinal header (this is for testing purposes)
  header('Access-Control-Allow-Origin: *');
  // Default status is error
  $status = !empty($_POST) ? "success" : "error";
  // Response
  $res->post = $_POST;
  $res->files = $_FILES;
  $res->status = $status;
  echo json_encode($res);
?>
