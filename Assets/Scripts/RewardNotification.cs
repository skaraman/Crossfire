using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class RewardNotification : MonoBehaviour {
	string[] text = new string[] {
		"+1 AP\nreach 2000 points",
		"+2 AP\nreach 5000 points",
		"+3 AP\nreach 10000 points",
		"+1 AP\nsurvive 10 seconds",
		"+2 AP\nsurvive 30 seconds",
		"+3 AP\nsurvive 90 seconds",
		"+4 AP\nreach 15000 points",
		"+5 AP\nreach 30000 points",
		"+4 AP\nsurvive 180 seconds",
		"+5 AP\nsurvive 360 second"
	};
	public void MoveAndFade(int t){
		destroy ();
		gameObject.GetComponent<Text> ().text = text [t];
		gameObject.SetActive (true);
		gameObject.GetComponent<Text> ().CrossFadeAlpha (0f, 2f, false);
		iTween.MoveTo (gameObject, iTween.Hash(
			"y", 2f, 
			"time", 2f, 
			"delay", 0f, 
			"oncomplete","destroy")
		);
	}
	void destroy(){
		gameObject.SetActive (false);
		transform.position = new Vector3 (0, 0, 0);
	}
}
