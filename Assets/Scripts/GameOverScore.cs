using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class GameOverScore : MonoBehaviour {
	GameObject scoreCanvas;
	GameObject mm;
	Score s;
	Achievements a;
	GameObject t;
	// Use this for initialization
	void Start () {
		a = GameObject.Find ("Achievements").GetComponent<Achievements> ();
		scoreCanvas = a.ScoreCanvas;
		s = scoreCanvas.GetComponent<Score> ();
		GameObject score = s.score;
		Text scoreText = score.GetComponent<Text> ();
		scoreText.color = Color.white;
		score.GetComponent<RectTransform>().localPosition = new Vector3 (0, 160, 0);
		s.setHighScore ();

		mm = a.MainMenuCanvas;
		MainMenu mms = mm.GetComponent<MainMenu> ();
		mms.title.GetComponent<Text> ().text = "Game Over";
		mm.SetActive (true);

		a.aPoints.GetComponent<Text> ().text = a.points.ToString();
		PlayerPrefs.SetInt ("AP", a.points);
		a.gameStarted = false;
		a.a1 = false;a.a2 = false;a.a3 = false;
		a.a4 = false;a.a5 = false;a.a6 = false;
		a.gameTime = 0f;
	}
	/*public void clear(bool b){
		score.SetActive (b);
	}*/
}
