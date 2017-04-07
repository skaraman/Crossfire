using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FindPlayerToggle : MonoBehaviour {
	GameObject player;
	public void Toggle(bool b){
		if (b == false) {
			player = GameObject.FindWithTag ("Player");
			player.SetActive (b);
		}
		if (b == true)
			player.SetActive (b);
	}
}
