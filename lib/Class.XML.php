<?php
/*
author: Vinicius Gomes
email:vinigomescunha at gmail.com
*/
Class XMLData {

	private $file = "../data/data.xml";/* filename required*/
	public $xml; /* xml data will be inserted */
	public $status = false; /* status of execution */
	public $fields; /* POST fields to manipulation */
	public $offset = 0;
	public $limit = 4;

	public function __construct() {
		/* in the construct put POST data in the field to manipulation */
		$this->fields = filter_input(INPUT_POST, 'fields', FILTER_DEFAULT,FILTER_REQUIRE_ARRAY);
	}

	public function load_xml() {
		/* load xml file */
		$this->xml = @simplexml_load_file($this->file);
	}

	public function json($d) {
		/* return json encoded */
		$result = ['result' => $d];
		header('Content-Type: application/json');
		return json_encode($result);
	}

	public function add_child() {
		/* add child to nodes */
		$node = $this->xml->addChild('node');
		if (!empty($this->fields)) {
			foreach($this->fields as $k => $v) $node->addChild($k, $v);
			$node->addChild('id', uniqid());
			return true;
		} else {
			return false;
		}
	}

	public function update_values() {
		/* get the data, data population to Update */
		$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_SPECIAL_CHARS);
		$data = $id ? $this->xml->xpath("//*[contains(id,'$id')]") : false;
		if (!empty($data) && !empty($this->fields)) {
			foreach($this->fields as $k => $v) $data[0]->$k = $v;
			return true;
		} else {
			return false;
		}
	}

	public function array_parcial_xml() {
		$limit = $this->limit;
		$c = $this->xml->node->count() ;/* count total of nodes */
		/* Check if total is greater than the limit  */
		$p = $c > $this->offset * $limit? $this->offset * $limit : $c ;/*nodes paged*/
		/* Check if total is greater than the limit + paged lines */
		$rn = $c > $limit + $p ? $limit + $p : $c;/* nodes remained */
		$n = []; /* array of nodes */
		for($i=$p;$i<$rn;$i++) $n[] = $this->xml->node[$i];
		$n['rows'] = $c;
		return $n;
	}

	public function update() {
		/* Update Function */
		$this->load_xml();
		$this->status = false;
		$this->status = $this->update_values();
		echo $this->json($this->status);
		if($this->status) $this->xml->asXML($this->file);
	}

	public function create() {
		/* Create Function */
		$this->load_xml();
		$this->status = false;
		if($this->xml === FALSE) $this->xml = new SimpleXMLElement('<xml/>');
		$this->status = $this->add_child();
		
		echo $this->json($this->status);
		if($this->status) $this->xml->asXML($this->file);
	}

	public function find() {
		/* Find Function */
		$this->load_xml();
		$d = false ;
		$n = filter_input(INPUT_GET, 'n', FILTER_SANITIZE_SPECIAL_CHARS);
		$s = filter_input(INPUT_GET, 's', FILTER_SANITIZE_SPECIAL_CHARS);
		if($n && $s) $d = $this->xml->xpath("//*[contains($n,'$s')]"); 
		echo $this->json($d);
	}

	public function delete() {
		/* Delete Function */
		$this->load_xml();
		$this->status = false;
		$id = filter_input(INPUT_GET, 'id', FILTER_SANITIZE_SPECIAL_CHARS);
		$data = $id ? $this->xml->xpath("//node[id='$id']") : false;
		if(!empty($data)) {
			$dom = dom_import_simplexml($data[0]);
			$dom->parentNode->removeChild($dom);
			$this->status = true;
		}
		echo $this->json($this->status);
		if($this->status) $this->xml->asXML($this->file);
	}

	public function list_all() {
		/* List Function */
		$this->load_xml();
		$page = filter_input(INPUT_GET, 'page', FILTER_SANITIZE_SPECIAL_CHARS);
		$limit = filter_input(INPUT_GET, 'limit', FILTER_SANITIZE_SPECIAL_CHARS);
		if($limit  && is_numeric($limit)) $this->limit = $limit;
		$this->offset = $page ? $page : 0 ;
		$n = $this->xml ? $this->array_parcial_xml() : false;
		echo $this->json($n);
		
	}
}
