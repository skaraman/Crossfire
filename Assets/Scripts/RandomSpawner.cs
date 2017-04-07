using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class RandomSpawner : MonoBehaviour {
	public GameObject yellowStar;
	public GameObject blueStar;
	public GameObject greenStar;
	public GameObject orangeStar;
	public GameObject redStar;
	public GameObject pinkStar;
	public GameObject purpleStar;
	public GameObject greyStar;
	public GameObject blackStar;
	public GameObject rock1;
	public GameObject rock2;
	public float timer;
	public float speed;
	GameObject aObj;
	Achievements a;
	Score scoreCanvasScript;
	Text scoreText;
	public List<GameObject> bonusStars;
	float proj;
	float[] sizes = new float[5] {1.5f, 1.75f, 2.0f, 2.25f, 2.5f};
	public int teirReducer;
	public int speedReducer;

	int bmin, bmax, gmin, gmax, omin, omax, pmin, pmax,
	rmin, rmax, prmin, prmax, grmin, grmax, blmin, blmax;



	// Use this for initialization
	public void Start () {
		bonusStars.Add (pinkStar);
		bonusStars.Add (greenStar);
		bonusStars.Add (orangeStar);
		bonusStars.Add (redStar);
		bonusStars.Add (blueStar);
		bonusStars.Add (purpleStar);
		bonusStars.Add (greyStar);
		bonusStars.Add (blackStar);
		aObj = GameObject.Find ("Achievements");
		a = aObj.GetComponent<Achievements> ();
		scoreCanvasScript = a.ScoreCanvas.GetComponent<Score> ();
		scoreCanvasScript.score.SetActive (true);
		scoreText = scoreCanvasScript.score.GetComponent<Text> ();
		teirReducer = 1;
		speedReducer = 1;
		StartCoroutine (Randomize ());

		pmin = 0;
		pmax = int.Parse(
			a.pDSR.GetComponent<Text> ().text.Replace(".", "").Replace("%",""));
		gmin = pmax + 1;
		gmax = gmin + int.Parse(
			a.gDSR.GetComponent<Text> ().text.Replace(".", "").Replace("%",""));
		omin = gmax + 1;
		omax = omin + int.Parse(
			a.oDSR.GetComponent<Text> ().text.Replace(".", "").Replace("%",""));
		rmin = omax + 1;
		rmax = rmin + int.Parse(
			a.rDSR.GetComponent<Text> ().text.Replace(".", "").Replace("%",""));

		bmin = rmax + 1;
		bmax = bmin + int.Parse(
			a.bDSR.GetComponent<Text> ().text.Replace(".", "").Replace("%",""));
		prmin = bmax + 1;
		prmax = prmin + int.Parse(
			a.prDSR.GetComponent<Text> ().text.Replace(".", "").Replace("%",""));
		grmin = prmax + 1;
		grmax = grmin + int.Parse(
			a.grDSR.GetComponent<Text> ().text.Replace(".", "").Replace("%",""));
		blmin = grmax + 1;
		blmax = blmin + int.Parse(
			a.blDSR.GetComponent<Text> ().text.Replace(".", "").Replace("%",""));
	}
	// Generate a random timer and speed based on the current game score
	IEnumerator Randomize () {
		int scoreInt = int.Parse (scoreText.text);
		int[,] timingTeirs = new int[,] { 
			{ 80, 100 }, { 60, 80 }, { 40, 60 }, { 30, 50 }, { 25, 40 } 
		};
		int[,] speedTeirs = new int[,] { 
			{ 7, 10 }, { 8, 11 }, { 9, 12 }, { 10, 12 }, { 11, 12 } 
		};
		int timingTeir = 0;
		int speedTeir = 0;
		int timerCheck = scoreInt / teirReducer;
		int speedCheck = scoreInt / speedReducer;
		if (timerCheck < 800) {
			timingTeir = 0;
		} else if (timerCheck < 1200) {
			timingTeir = 1;
		} else if (timerCheck < 2500) {
			timingTeir = 2;
		} else if (timerCheck < 5000) {
			timingTeir = 3;
		} else if (timerCheck < 10000) {
			timingTeir = 4;
		}
		if (speedCheck < 800) {
			speedTeir = 0;
		} else if (speedCheck < 1200) {
			speedTeir = 1;
		} else if (speedCheck < 2500) {
			speedTeir = 2;
		} else if (speedCheck < 5000) {
			speedTeir = 3;
		} else if (speedCheck < 10000) {
			speedTeir = 4;
		}
		int tmin = timingTeirs [timingTeir, 0];
		int tmax = timingTeirs [timingTeir, 1];
		int smin = speedTeirs [speedTeir, 0];
		int smax = speedTeirs [speedTeir, 1];
		timer = (float)(Random.Range (tmin, tmax) / 100.0);
		speed = (float)(Random.Range (smin, smax));
		// before scoreCap 50/50 split for rock/yellow;
		// i want a 1 percent chance of bonusStars after scoreCap

		// minimum positions are
		// x 6.5 : y 10.75
		// rotation on z axis
		// facing: 0 right, 90 up, 180 left, 270 down
		// 45 ur, 135 ul, 225 dl, 315 dr
		int r = 0, u = 90, l = 180, d = 270,
		ur = 45, ul = 135, dl = 225, dr = 315;
		GameObject obj = yellowStar;

		proj = Random.Range (0, 2); // star or asteroid

		if (proj == 0 && scoreInt > 800) {
			int rnd = Random.Range (0, 2);
			if (rnd == 0 ) {
				rnd = Random.Range (0, 10000);
				if (rnd >= pmin && rnd <= pmax) {
					obj = bonusStars [0];
				} else if (rnd >= gmin && rnd <= gmax) {
					obj = bonusStars [1];
				} else if (rnd >= omin && rnd <= omax) {
					obj = bonusStars [2];
				} else if (rnd >= rmin && rnd <= rmax) {
					obj = bonusStars [3];
				} else if (rnd >= bmin && rnd <= bmax) {
					obj = bonusStars [4];
				} else if (rnd >= prmin && rnd <= prmax) {
					obj = bonusStars [5];
				} else if (rnd >= grmin && rnd <= grmax) {
					obj = bonusStars [6];
				} else if (rnd >= blmin && rnd <= blmax) {
					obj = bonusStars [7];
				} else {
					obj = yellowStar;
				}
			}
		} else if (proj == 1) {
			int rnd = Random.Range (0, 2);
			if (rnd == 0) {
				obj = rock1;
			} else {
				obj = rock2;
			}
		}



		int side = Random.Range (0, 4);
		int diag = Random.Range (0, 2);
		float x = 0.0f, y = 0.0f;
		int z = 0;
		Vector2 velo = new Vector2 (0, 0);
		if (side == 0) {  //top
			x = Random.Range(-6.5f,6.5f);
			y = 10.75f;
			if (diag == 1) {
				if (x > 0) {
					z = dl;
					velo.x = -speed;
				} else {
					z = dr;
					velo.x = speed;
				}
			} else {
				z = d;
			}
			velo.y = -speed;
		} else if (side == 1) {  //right
			y = Random.Range(-10.75f,10.75f);
			x = 6.5f;
			if (diag == 1) {
				if (y > 0) {
					velo.y = -speed;
					z = dl;
				} else {
					z = ul;
					velo.y = speed;
				}
			} else {
				z = l;
			}
			velo.x = -speed;
		} else if (side == 2) {  //bot
			x = Random.Range(-6.5f,6.5f);
			y = -10.75f;
			if (diag == 1) {
				if (x > 0) {
					z = ul;
					velo.x = -speed;
				} else {
					z = ur;
					velo.x = speed;
				}
			} else {
				z = u;
			}
			velo.y = speed;
		} else if (side == 3) {  //left
			y = Random.Range(-10.75f,10.75f);
			x = -6.5f;
			if (diag == 1) {
				if (y > 0) {
					z = dr;
					velo.y = -speed;
				} else {
					z = ur;
					velo.y = speed;
				}
			} else {
				z = r;
			}
			velo.x = speed;
		}
		/* 
		GameObject[] rar = new GameObject[] {
			blueStar,
			purpleStar,
			greyStar,
			blackStar
		};
		int rr = Random.Range(0,rar.Length);
		obj = rar [rr];
		*/
		//obj = blackStar;
		GameObject projectile = Instantiate (
			                        obj,
			                        new Vector3 (x, y, -2f),
			                        new Quaternion ()
		                        );
		projectile.transform.Rotate (0, 0, z);

		int size = Random.Range(0, sizes.Length);
		float s = sizes[size];
		projectile.transform.localScale = new Vector3 (s, s, 0);

		Rigidbody2D rb = projectile.GetComponent<Rigidbody2D> ();
		rb.AddForce (velo,ForceMode2D.Impulse);
		yield return new WaitForSeconds (timer);
		StartCoroutine (Randomize ());
	}
	void Update(){
		Text scoreText = scoreCanvasScript.score.GetComponent<Text> ();
		int scoreInt = int.Parse (scoreText.text);
		scoreInt++;
		scoreText.text = scoreInt.ToString ();
	}
}
