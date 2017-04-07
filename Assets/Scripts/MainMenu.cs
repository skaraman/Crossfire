using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MainMenu : MonoBehaviour {
	GameObject mainmenu;
	public GameObject title;
	void Start (){
		title = GameObject.Find ("Title");
	}
	void Awake () {
		DontDestroyOnLoad (this.gameObject);
	}
}
