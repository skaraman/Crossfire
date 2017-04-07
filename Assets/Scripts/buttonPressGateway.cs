using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class buttonPressGateway : MonoBehaviour {
	GameObject go;
	Achievements a;
	void Start(){
		go = GameObject.Find ("Achievements");
		a = go.GetComponent<Achievements> ();
	}
	public void button(string s){
		a.buttonProcess (s);
	}
}
