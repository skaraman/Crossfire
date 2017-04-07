using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GameOverSound : MonoBehaviour {
	GameObject music;
	public GameObject sOff;
	public GameObject sOn;
	AudioSource m;
	void Start(){
		music = GameObject.Find ("Music");
		m = music.GetComponent<AudioSource> ();
		if (PlayerPrefs.HasKey ("music")) {;
			int music = PlayerPrefs.GetInt ("music");
			if (music == 0) {
				sOff.SetActive (true);
				sOn.SetActive (false);
			} else {
				sOff.SetActive (false);
				sOn.SetActive (true);
			}
		}

	}
	public void toggleSound(bool b){
		if (b == false) {
			PlayerPrefs.SetInt ("music", 0);
			PlayerPrefs.Save ();
			m.Pause ();
		} else {
			PlayerPrefs.SetInt ("music", 1);
			PlayerPrefs.Save ();
			m.Play ();
		}
	}
}
