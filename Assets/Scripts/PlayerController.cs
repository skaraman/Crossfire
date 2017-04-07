using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class PlayerController : MonoBehaviour {
	AudioSource[] sounds;
	public GameObject sfx;
	GameObject score;
	Coroutine slowed = null;
	Coroutine warped = null;
	Coroutine magnetized = null;
	Coroutine invincibled = null;
	public GameObject invincibleProgressBar;
	public GameObject slowTimeProgressBar;
	public GameObject warpProgressBar;
	public GameObject magnetProgressBar;
	bool isInvc = false;
	int lives;
	public GameObject life;

	public bool isMagnetized = false;
	bool isWarp = false;
	bool sound;

	Achievements a;
	GameObject livez;

	int y, p;
	float b, pr, gr, bl;
	// Use this for initialization
	void Start () {
		a = GameObject.Find ("Achievements").GetComponent<Achievements> ();
		score = a.ScoreCanvas.GetComponent<Score>().score;
		livez = a.livez;
		livez.SetActive (true);
		sfx = GameObject.Find ("SFX");
		sounds = sfx.GetComponents<AudioSource> ();
		lives = 0;
		addLife ();
		sound = true;
		if (PlayerPrefs.HasKey ("music")) {
			int music = PlayerPrefs.GetInt ("music");
			if (music == 0) {
				sound = false;
			}
		}
		y = int.Parse(a.yDBE.GetComponent<Text> ().text.Replace(" points",""));
		p = int.Parse(a.pDBE.GetComponent<Text> ().text.Replace(" points",""));
		b = float.Parse(
			a.bDBE.GetComponent<Text> ().text.Replace(" seconds",""));
		pr = float.Parse(
			a.prDBE.GetComponent<Text> ().text.Replace(" seconds",""));
		gr = float.Parse(
			a.grDBE.GetComponent<Text> ().text.Replace(" seconds",""));
		bl = float.Parse(
			a.blDBE.GetComponent<Text> ().text.Replace(" seconds",""));
	}

	void Update(){
		if (isWarp == true && Input.GetMouseButtonDown(0)) { 
			Vector2 mouse = new Vector2(Input.mousePosition.x,Input.mousePosition.y);
			Ray ray = Camera.main.ScreenPointToRay(mouse);
			transform.position = new Vector3 (
				ray.origin.x,
				ray.origin.y,
				-2
			);
		}
	}

	void OnTriggerEnter2D(Collider2D c){
		if (c.gameObject.name == "Rock1(Clone)" ||
		  	c.gameObject.name == "Rock2(Clone)") {
			if (sound == true)
				sounds [1].Play ();

			if (isInvc == false) {
				if (lives <= 0) {



					SceneManager.LoadScene ("GameOver");
				} else if (lives > 0) {
					lives--;
					List<GameObject> children = new List<GameObject>();
					foreach (Transform child in livez.transform) {
						children.Add (child.gameObject);
					}
					Destroy (children [lives]);
				}
			}
		}
		if (c.gameObject.name == "RedStar(Clone)") {
			if (lives < 2) {
				if (sound == true)
					sounds [0].Play ();
				addLife ();
			}
		}
		if (c.gameObject.name == "YellowStar(Clone)") {
			if (sound == true)
				sounds [0].Play ();
			Text scoreText = score.GetComponent<Text> ();
			int scoreInt = int.Parse (scoreText.text);
			float addScore = c.gameObject.transform.localScale.x * 50f;
			scoreInt+= (int)addScore + y;
			scoreText.text = scoreInt.ToString ();
		}
		if (c.gameObject.name == "GreenStar(Clone)") {
			if (sound == true)
				sounds [0].Play ();
			GameObject eM = GameObject.FindWithTag ("Event");
			RandomSpawner spawner = eM.GetComponent<RandomSpawner>();
			spawner.teirReducer += 2;
		}
		if (c.gameObject.name == "OrangeStar(Clone)") {
			if (sound == true)
				sounds [0].Play ();
			GameObject eM = GameObject.FindWithTag ("Event");
			RandomSpawner spawner = eM.GetComponent<RandomSpawner>();
			spawner.speedReducer += 10;
		}
		if (c.gameObject.name == "PinkStar(Clone)") {
			if (sound == true)
				sounds [0].Play ();
			Text scoreText = score.GetComponent<Text> ();
			int scoreInt = int.Parse (scoreText.text);
			scoreInt+= p;
			scoreText.text = scoreInt.ToString ();
		}
		if (c.gameObject.name == "BlueStar(Clone)") {
			if (sound == true)
				sounds [0].Play ();
			if (invincibled != null) StopCoroutine (invincibled);
			invincibled = StartCoroutine ("invincible");
		}
		if (c.gameObject.name == "PurpleStar(Clone)") {
			if (sound == true)
				sounds [0].Play ();
			if (warped != null) StopCoroutine (warped);
			warped = StartCoroutine ("warp");
		}
		if (c.gameObject.name == "GreyStar(Clone)") {
			if (sound == true)
				sounds [0].Play ();
			if (slowed != null) StopCoroutine (slowed);
			slowed = StartCoroutine ("slowTime");
		}
		if (c.gameObject.name == "BlackStar(Clone)") {
			if (sound == true)
				sounds [0].Play ();
			if (magnetized != null) StopCoroutine (magnetized);
			magnetized = StartCoroutine ("magnet");
		}
	}

	IEnumerator slowTime(){
		slowTimeProgressBar.SetActive (true);
		ProgressBar pb = slowTimeProgressBar.GetComponent<ProgressBar> ();
		pb.oE (a);
		pb.cooldown = true;
		Time.timeScale = 0.5f;
		yield return new WaitForSeconds (gr/2);
		Time.timeScale = 1.0f;
		pb.cooldown = false;
		slowTimeProgressBar.SetActive (false);
	}

	IEnumerator invincible(){
		invincibleProgressBar.SetActive (true);
		ProgressBar pb = invincibleProgressBar.GetComponent<ProgressBar> ();
		pb.oE (a);
		pb.cooldown = true;
		isInvc = true;
		yield return new WaitForSeconds (b);
		isInvc = false;
		pb.cooldown = false;
		invincibleProgressBar.SetActive (false);
	}

	IEnumerator warp(){
		warpProgressBar.SetActive (true);
		ProgressBar pb = warpProgressBar.GetComponent<ProgressBar> ();
		pb.oE (a);
		pb.cooldown = true;
		isWarp = true;
		yield return new WaitForSeconds (pr);
		isWarp = false;
		Time.timeScale = 1.0f;
		pb.cooldown = false;
		warpProgressBar.SetActive (false);
	}

	IEnumerator magnet(){
		magnetProgressBar.SetActive (true);
		ProgressBar pb = magnetProgressBar.GetComponent<ProgressBar> ();
		pb.oE (a);
		pb.cooldown = true;
		isMagnetized = true;
		yield return new WaitForSeconds (bl);
		isMagnetized = false;
		pb.cooldown = false;
		magnetProgressBar.SetActive (false);
	}

	public void addLife(){
		float x = (-50 * (float)lives);
		GameObject l = Instantiate (life);
		l.transform.position = new Vector3 (x, 0, 0);
		l.transform.rotation = new Quaternion ();
		l.transform.SetParent (livez.transform, false);
		lives++;
	}
}


