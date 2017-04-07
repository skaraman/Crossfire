using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ProgressBar : MonoBehaviour {
	float wait;
	public bool cooldown;
	public Image left;
	public Image right;
	public Image flash;

	public string bar;
	// Use this for initialization

	public void oE(Achievements a){
		left.fillAmount = 1.0f;
		right.fillAmount = 1.0f;

		if (bar == "blue") {
			this.wait = float.Parse (a.bDBE.GetComponent<Text> ().text.Replace (" seconds", ""));
		} else if (bar == "grey") {
			this.wait = float.Parse (a.grDBE.GetComponent<Text> ().text.Replace (" seconds", ""))/2;
		} else if (bar == "purple") {
			this.wait = float.Parse (a.prDBE.GetComponent<Text> ().text.Replace (" seconds", ""));
		} else if (bar == "black") {
			this.wait = float.Parse (a.blDBE.GetComponent<Text> ().text.Replace (" seconds", ""));
		}
	}

	// Update is called once per frame
	void Update () {
		if (cooldown == true) {
			left.fillAmount -= 1.0f / this.wait * Time.deltaTime;
			right.fillAmount -= 1.0f / this.wait * Time.deltaTime;
		}
	}
}
