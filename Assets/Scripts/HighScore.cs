using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class HighScore : MonoBehaviour {
	void Start () {
		if (PlayerPrefs.HasKey ("HighScore")) {
			Text hs = GetComponent<Text> ();
			int hsi = PlayerPrefs.GetInt ("HighScore");
			hs.text = hsi.ToString ();
		}
	}
}
