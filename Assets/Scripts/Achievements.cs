using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class Achievements : MonoBehaviour {
	public GameObject aPoints;
	string aPointst;
	public int points;

	public GameObject MainMenuCanvas;
	public GameObject ScoreCanvas;
	public GameObject livez;

	public GameObject ypBE;
	public GameObject yDBE;

	public GameObject bpSR;
	public GameObject bDSR;

	public GameObject bpBE;
	public GameObject bDBE;

	public GameObject gpSR;
	public GameObject gDSR;
	public GameObject opSR;
	public GameObject oDSR;

	public GameObject ppSR;
	public GameObject pDSR;

	public GameObject ppBE;
	public GameObject pDBE;

	public GameObject rpSR;
	public GameObject rDSR;

	public GameObject prpSR;
	public GameObject prDSR;

	public GameObject prpBE;
	public GameObject prDBE;

	public GameObject grpSR;
	public GameObject grDSR;

	public GameObject grpBE;
	public GameObject grDBE;

	public GameObject blpSR;
	public GameObject blDSR;

	public GameObject blpBE;
	public GameObject blDBE;

	public float gameTime;
	public bool gameStarted;
	Text score;

	public bool a1, a2, a3, a4, a5, a6, a7, a8, a9, a10;
	public GameObject Reward;

	void Start(){
		if (PlayerPrefs.HasKey("AP")){
			aPoints.GetComponent<Text> ().text = PlayerPrefs.GetInt("AP").ToString();
		}
		aPointst = aPoints.GetComponent<Text> ().text;
		points = int.Parse (aPointst);
		if (PlayerPrefs.HasKey ("ypBE")){
			setP (ypBE, yDBE, "yellow");
		}
		if (PlayerPrefs.HasKey ("ppBE")){
			setP (ppBE, pDBE, "pink");
		}
		if (PlayerPrefs.HasKey ("ppSR")){
			setP (ppSR, pDSR, "SR");
		}
		if (PlayerPrefs.HasKey ("gpSR")){
			setP (gpSR, gDSR, "SR");
		}
		if (PlayerPrefs.HasKey ("opSR")){
			setP (opSR, oDSR, "SR");
		}
		if (PlayerPrefs.HasKey ("rpSR")){
			setP (rpSR, rDSR, "SR");
		}
		if (PlayerPrefs.HasKey ("bpSR")){
			setP (bpSR, bDSR, "SR");
		}
		if (PlayerPrefs.HasKey ("prpSR")){
			setP (prpSR, prDSR, "SR");
		}
		if (PlayerPrefs.HasKey ("grpSR")){
			setP (grpSR, grDSR, "SR");
		}
		if (PlayerPrefs.HasKey ("blpSR")){
			setP (blpSR, blDSR, "SR");
		}
		if (PlayerPrefs.HasKey ("bpBE")){
			setP (bpBE, bDBE, "seconds");
		}
		if (PlayerPrefs.HasKey ("prpBE")){
			setP (prpBE, prDBE, "seconds");
		}
		if (PlayerPrefs.HasKey ("grpBE")){
			setP (grpBE, grDBE, "seconds");
		}
		if (PlayerPrefs.HasKey ("blpBE")){
			setP (blpBE, blDBE, "seconds");
		}
		gameTime = 0.0f;
		score = ScoreCanvas.GetComponent<Score> ().score.GetComponent<Text> ();
		PlayerPrefs.DeleteAll ();
	}
	void Awake () {
		DontDestroyOnLoad (this.gameObject);
	}
	void Update() {
		if (gameStarted == true) {
			gameTime += Time.deltaTime;
			//print (gameTime);
			//print  (score.text);
			if (int.Parse (score.text) > 2000 && a1 == false) {
				points += 1;
				rewardNotification ("a1");
			} else if (int.Parse (score.text) > 5000 && a2 == false) {
				points += 2;
				rewardNotification ("a2");
			} else if (int.Parse (score.text) > 10000 && a3 == false) {
				points += 3;
				rewardNotification ("a3");
			} else if (gameTime > 10 && a4 == false) {
				points += 1;
				rewardNotification ("a4");
			} else if (gameTime > 30 && a5 == false) {
				points += 2;
				rewardNotification ("a5");
			} else if (gameTime > 90 && a6 == false) {
				points += 3;
				rewardNotification ("a6");
			} else if (int.Parse (score.text) > 15000 && a7 == false) {
				points += 4;
				rewardNotification ("a7");
			} else if (int.Parse (score.text) > 30000 && a8 == false) {
				points += 5;
				rewardNotification ("a8");
			} else if (gameTime > 180 && a9 == false) {
				points += 4;
				rewardNotification ("a9");
			} else if (gameTime > 360 && a10 == false) {
				points += 5;
				rewardNotification ("a10");
			}
		}
	}
	void setP (GameObject obj, GameObject details, string type) {
		int i = PlayerPrefs.GetInt (obj.name);
		obj.GetComponent<Text> ().text = i.ToString ();
		if (type == "SR") {
			float baseline = 1.25f;
			float newDetails = baseline + ((float)i / 100.0f);
			details.GetComponent<Text> ().text = newDetails.ToString ("0.00") + "%";
		} else if (type == "yellow") {
			details.GetComponent<Text> ().text = i.ToString () + " points";
		} else if (type == "pink") {
			int baseline = 1000;
			int newDetails = baseline + (i * 10);
			details.GetComponent<Text> ().text = newDetails.ToString () + " points";
		} else if (type == "seconds") {
			float baseline = 5f;
			float newDetails = baseline + ((float)i / 20.0f);
			details.GetComponent<Text> ().text = newDetails.ToString () + " seconds";
		}
	}
	void minus (GameObject obj, GameObject details, string type) {
		string t = obj.GetComponent<Text> ().text;
		int i = int.Parse(t);
		if (i == 0) {
			return;
		} else {
			i--;
			obj.GetComponent<Text> ().text = i.ToString ();
			PlayerPrefs.SetInt (obj.name, i);
			points++;
			aPoints.GetComponent<Text> ().text = points.ToString ();
			if (type == "SR") {
				float baseline = float.Parse (
					                 details.GetComponent<Text> ().text.TrimEnd (new char[] { '%' })
				                 );
				float newDetails = baseline - 0.01f;
				details.GetComponent<Text> ().text = newDetails.ToString ("0.00") + "%";
			} else if (type == "yellow" || type == "pink") {
				int baseline = int.Parse (
					               details.GetComponent<Text> ().text.Replace (" points", "")
				               );
				int j = 1;
				if (type == "pink")
					j = 10;
				int newDetails = baseline - j;
				details.GetComponent<Text> ().text = newDetails.ToString () + " points";
			} else if (type == "seconds") {
				string tt = details.GetComponent<Text> ().text;
				float baseline = float.Parse (
					                 tt.Replace (" seconds", "")
				                 );
				float newDetails = baseline - 0.05f;
				details.GetComponent<Text> ().text = newDetails.ToString ("0.00") + " seconds";
			}
		}
	}
	void plus (GameObject obj, GameObject details, string type) {
		if (points == 0)
			return;
		string t = obj.GetComponent<Text> ().text;
		int i = int.Parse(t);
		i++;
		obj.GetComponent<Text> ().text = i.ToString ();
		PlayerPrefs.SetInt (obj.name, i);
		points--;
		aPoints.GetComponent<Text> ().text = points.ToString ();
		if (type == "SR") {
			float baseline = float.Parse (
				details.GetComponent<Text> ().text.TrimEnd(new char[] {'%'})
			);
			float newDetails = baseline + 0.01f;
			details.GetComponent<Text> ().text = newDetails.ToString ("0.00") + "%";
		} else if (type == "yellow" || type == "pink") {
			int baseline = int.Parse (
				details.GetComponent<Text> ().text.Replace (" points", "")
			);
			int j = 1;
			if (type == "pink")
				j = 10;
			int newDetails = baseline + j;
			details.GetComponent<Text> ().text = newDetails.ToString () + " points";
		} else if (type == "seconds") {
			string tt = details.GetComponent<Text> ().text;
			float baseline = float.Parse (
				tt.Replace (" seconds", "")
			);
			float newDetails = baseline + 0.05f;
			details.GetComponent<Text> ().text = newDetails.ToString ("0.00") + " seconds";
		}
	}
	public void buttonProcess (string s) {
		aPointst = aPoints.GetComponent<Text> ().text;
		switch (s) {
		case "yminusBE":
			minus (ypBE, yDBE, "yellow");
			break;
		case "yplusBE":
			plus (ypBE, yDBE, "yellow");
			break;
		case "pminusSR":
			minus (ppSR, pDSR, "SR");
			break;
		case "pplusSR":
			plus (ppSR, pDSR, "SR");
			break;
		case "pminusBE":
			minus (ppBE, pDBE, "pink");
			break;
		case "pplusBE":
			plus (ppBE, pDBE, "pink");
			break;
		case "gminusSR":
			minus (gpSR, gDSR, "SR");
			break;
		case "gplusSR":
			plus (gpSR, gDSR, "SR");
			break;
		case "ominusSR":
			minus (opSR, oDSR, "SR");
			break;
		case "oplusSR":
			plus (opSR, oDSR, "SR");
			break;
		case "rminusSR":
			minus (rpSR, rDSR, "SR");
			break;
		case "rplusSR":
			plus (rpSR, rDSR, "SR");
			break;
		case "bminusSR":
			minus (bpSR, bDSR, "SR");
			break;
		case "bplusSR":
			plus (bpSR, bDSR, "SR");
			break;
		case "bminusBE":
			minus (bpBE, bDBE, "seconds");
			break;
		case "bplusBE":
			plus (bpBE, bDBE, "seconds");
			break;
		case "prminusSR":
			minus (prpSR, prDSR, "SR");
			break;
		case "prplusSR":
			plus (prpSR, prDSR, "SR");
			break;
		case "prminusBE":
			minus (prpBE, prDBE, "seconds");
			break;
		case "prplusBE":
			plus (prpBE, prDBE, "seconds");
			break;
		case "grminusSR":
			minus (grpSR, grDSR, "SR");
			break;
		case "grplusSR":
			plus (grpSR, grDSR, "SR");
			break;
		case "grminusBE":
			minus (grpBE, grDBE, "seconds");
			break;
		case "grplusBE":
			plus (grpBE, grDBE, "seconds");
			break;
		case "blminusSR":
			minus (blpSR, blDSR, "SR");
			break;
		case "blplusSR":
			plus (blpSR, blDSR, "SR");
			break;
		case "blminusBE":
			minus (blpBE, blDBE, "seconds");
			break;
		case "blplusBE":
			plus (blpBE, blDBE, "seconds");
			break;
		}
	}
	void rewardNotification (string S){
		if (S == "a1") {
			a1 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (0);
		} else if (S == "a2") {
			a2 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (1);
		}else if (S == "a3") {
			a3 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (2);
		}else if (S == "a4") {
			a4 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (3);
		}else if (S == "a5") {
			a5 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (4);
		}else if (S == "a6") {
			a6 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (5);
		}else if (S == "a7") {
			a7 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (6);
		}else if (S == "a8") {
			a8 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (7);
		}else if (S == "a9") {
			a9 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (8);
		} else if (S == "a10") {
			a10 = true;
			Reward.GetComponent<RewardNotification> ().MoveAndFade (9);
		}
	}
}
