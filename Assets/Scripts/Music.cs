using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Music : MonoBehaviour {
	public GameObject sOff;
	public GameObject sOn;
	public void setMusic(bool s) {
		int music = 0;
		if (s == true)
			music = 1;
		else
			music = 0;
		PlayerPrefs.SetInt ("music", music);
		PlayerPrefs.Save ();
	}
	void Awake() {
		DontDestroyOnLoad (this.gameObject);
		if (PlayerPrefs.HasKey ("music")) {;
			int music = PlayerPrefs.GetInt ("music");
			AudioSource myAS = GetComponent<AudioSource> ();
			if (music == 0) {
				sOff.SetActive (true);
				sOn.SetActive (false);
				myAS.Pause ();
			} else {
				sOff.SetActive (false);
				sOn.SetActive (true);
				myAS.Play ();
			}
		}
	}
}
