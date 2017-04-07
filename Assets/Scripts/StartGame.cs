using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class StartGame : MonoBehaviour {
	bool r = false;
	public void click(){
		if (!r) {
			r = true;
			GameObject.Find ("MainMenuCanvas").SetActive (false);
			GameObject.Find ("Achievements").GetComponent<Achievements> ().gameStarted = true;
			Text sgt = GetComponent<Text> ();
			sgt.text = "Restart";
			SceneManager.LoadScene ("Game");
		} else {
			restart ();
		}
	}
	void restart(){
		GameObject.Find ("MainMenuCanvas").SetActive (false);
		GameObject.Find ("Achievements").GetComponent<Achievements> ().gameStarted = true;
		GameObject score = GameObject.Find ("Score");
		Text text = score.GetComponent<Text> ();
		text.text = "0";
		SceneManager.LoadScene("Game");
	}
}
