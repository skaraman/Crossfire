using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Score : MonoBehaviour {
	private static Score instance = null;
	public static Score Instance {
		get { return instance; }
	}
	public GameObject score;
	public GameObject highScore;
	void Awake() {
		if (instance != null && instance != this) {
			Destroy(this.gameObject);
			return;
		} 
		else {
			instance = this;
		}
		DontDestroyOnLoad(this.gameObject);
	}
	public void setHighScore () {
		Text scoreText = score.GetComponent<Text> ();
		int scoreInt = int.Parse (scoreText.text);
		Text highScoreText = highScore.GetComponent<Text> ();
		int highScoreTextInt = int.Parse (highScoreText.text);
		if (scoreInt > highScoreTextInt) {
			highScoreText.text = scoreInt.ToString ();
			PlayerPrefs.SetInt ("HighScore", scoreInt);
			PlayerPrefs.Save ();
		}
	}
}
