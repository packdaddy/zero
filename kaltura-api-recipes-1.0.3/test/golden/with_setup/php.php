<?php
  require_once('lib/KalturaClient.php');

  $config = new KalturaConfiguration("YOUR_PARTNER_ID");
  $client = new KalturaClient($config);
  $ks = $client->session->start(
    "YOUR_KALTURA_SECRET",
    "YOUR_USER_ID",
    Kaltura.enums.KalturaSessionType.ADMIN,
    YOUR_PARTNER_ID);
  $client->setKS($ks);

  $filter = new KalturaMediaEntryFilter();

  $pager = new KalturaFilterPager();

  try {
    $result = $client->media->listAction(
      $filter, 
      $pager);
    var_dump($result);
  } catch (Exception $e) {
    echo $e->getMessage();
  }
?>
