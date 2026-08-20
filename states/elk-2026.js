/* Official 2026 elk general seasons. Merged into packs by pack-lib (species: elk).
 * Do not invent dates. Controlled / limited-entry / private-only hunts omitted or marked Private.
 * States without rows here have no Elk toggle.
 */
(function () {
  var IDN = 'IDFG 2026 Big Game brochure pp. 36–49 — general A/B zone tags only. Controlled hunts omitted. Confirm this unit/zone before hunting.';
  var UTN = 'Utah DWR 2026 Field Regulations Guidebook p.8 general-season bull elk. Conservative overlap of spike + any-bull windows. Paunsaugunt has no general archery elk. Extended archery omitted. Confirm hunt.utah.gov.';
  var MTN = 'FWP 2026 seasons page (Deer & Elk share these summary dates). Shoulder seasons omitted. Confirm this hunting district in the 2026 DEA booklet.';
  var CON = 'CPW 2026 Big Game brochure mountain elk windows. Most licenses are limited by hunt code (Gunnison 54/55/551 rifle now fully limited). Plains elk not encoded. Confirm the hunt-code table before hunting.';
  var ORN = 'ODFW 2026 Elk Seasons (eRegulations last updated Mar 31, 2026). General tags only. Controlled 200-series omitted. Confirm dfw.state.or.us / OAR 635-065.';
  var WAN = 'WAC 220-415-050 (2024–2026 elk general seasons) and WDFW eRegulations last updated May 1, 2026. Permit-only GMUs 157, 418, 437, 485, 522, 556, 621, 636, 653 and closed GMU 490 have no general rows. Master-hunter-only omitted. Confirm wdfw.wa.gov.';
  var NVN = 'NDOW 2026-27 Elk Hunting (eRegulations last updated May 27, 2026; NAC 502.361). Draw-only antlered hunts. Spike, antlerless, and depredation omitted. Confirm ndow.org.';
  var KYZ = ['BELL', 'BREATHITT', 'CLAY', 'FLOYD', 'HARLAN', 'JOHNSON', 'KNOTT', 'KNOX', 'LESLIE', 'LETCHER', 'MAGOFFIN', 'MARTIN', 'MCCREARY', 'PERRY', 'PIKE', 'WHITLEY'];
  var WYN = 'WGFD Chapter 7 Elk Hunting Seasons 2026. Hunt areas are not deer hunt areas. Confirm https://wgfd.wyo.gov/media/33695 before hunting.';

  function row(areas, kind, win, target, extra) {
    extra = extra || {};
    var o = {
      species: 'elk',
      areas: areas,
      type: extra.type || kind,
      land: extra.land || 'Either',
      target: target,
      limit: (extra.limit ? extra.limit + ' ' : '') + (extra.note || '')
    };
    if (kind === 'Archery') o.arch = win;
    else if (kind === 'Muzzle') o.muzzle = win;
    else o.gun = win;
    return o;
  }

  window.RS_ELK_SEASONS = {
    /* Official UDWR guidebook p.8 — overlap so spike units are never shown open on any-bull-only extra days. */
    UT: [
      row('ALL', 'Archery', ['2026-08-15', '2026-09-04'], 'Bull elk', { note: UTN, limit: 'General archery overlap Aug 15–Sept 4 (spike and any-bull). Any-bull archery continues to Sept 16 on any-bull units only — not encoded.' }),
      row('ALL', 'Firearm', ['2026-10-03', '2026-10-09'], 'Bull elk', { note: UTN, limit: 'General rifle overlap Oct 3–9 (spike Oct 3–15; any-bull early Oct 3–9). Late any-bull Oct 10–16 not encoded as statewide.' }),
      row('ALL', 'Muzzle', ['2026-10-28', '2026-11-05'], 'Bull elk', { note: UTN, limit: 'General muzzleloader Oct 28–Nov 5 on spike and any-bull units.' })
    ],

    /* Official FWP 2026 seasons page: Deer & Elk use the same summary windows. Youth Oct 15–16 is deer-only. */
    MT: [
      row('ALL', 'Archery', ['2026-09-05', '2026-10-18'], 'Elk', { note: MTN, limit: 'Archery Sept 5–Oct 18, 2026 (HD-specific tags).' }),
      row('ALL', 'General', ['2026-10-24', '2026-11-29'], 'Elk', { note: MTN, limit: 'General Oct 24–Nov 29 except backcountry HDs 150, 280, 316.' }),
      row(['150', '280', '316'], 'Backcountry', ['2026-09-15', '2026-11-29'], 'Elk', { note: MTN, limit: 'Backcountry HDs 150, 280, 316 general Sept 15–Nov 29.' }),
      row('ALL', 'Muzzle', ['2026-12-12', '2026-12-20'], 'Elk', { note: MTN, limit: 'Muzzleloader Dec 12–20, 2026 (confirm HD table).' })
    ],

    /* Official IDFG 2026 brochure general A/B tags. Private-ag / private-land-only hunts marked Private. */
    ID: (function () {
      var out = [];
      function add(areas, kind, win, target, extra) {
        extra = extra || {};
        extra.note = IDN;
        out.push(row(areas, kind, win, target, extra));
      }
      var PH = ['1', '2', '3', '4', '4A', '5', '6', '7', '9'];
      add(PH, 'Archery', ['2026-08-30', '2026-09-30'], 'Antlered elk', { type: 'A-tag archery', limit: 'Panhandle A tag archery antlered Aug 30–Sept 30.' });
      add(PH, 'Gun', ['2026-10-25', '2026-10-29'], 'Antlered elk', { type: 'A-tag any-weapon', limit: 'Panhandle A tag any-weapon antlered Oct 25–29.' });
      add(['4', '7', '9'], 'Muzzle', ['2026-11-15', '2026-12-01'], 'Antlered elk', { type: 'A-tag muzzle', limit: 'Panhandle A tag muzzleloader antlered Units 4,7,9 Nov 15–Dec 1.' });
      add(['1', '2', '3', '4A', '5'], 'Muzzle', ['2026-12-02', '2026-12-08'], 'Antlerless elk', { type: 'A-tag muzzle private', land: 'Private', limit: 'Panhandle A tag muzzle antlerless on/within 1 mi of private land Units 1,2,3,4A,5 Dec 2–8.' });
      add(['1', '2', '3', '4A', '5', '6'], 'Archery', ['2026-09-15', '2026-09-21'], 'Any elk', { type: 'A-tag archery private', land: 'Private', limit: 'Panhandle A tag archery any elk on/within 1 mi of private land Sept 15–21.' });
      add(PH, 'Archery', ['2026-12-10', '2026-12-16'], 'Antlered elk', { type: 'A-tag late archery', limit: 'Panhandle A tag archery antlered Dec 10–16.' });
      add(PH, 'Archery', ['2026-09-06', '2026-09-12'], 'Antlered elk', { type: 'B-tag archery', limit: 'Panhandle B tag archery antlered Sept 6–12.' });
      add(PH, 'Gun', ['2026-10-10', '2026-10-24'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Panhandle B tag any-weapon antlered Oct 10–24.' });

      add(['8', '8A', '11A'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Palouse A tag archery any elk Aug 30–Sept 30.' });
      add(['8', '8A', '11A'], 'Gun', ['2026-08-01', '2026-09-15'], 'Antlerless elk', { type: 'A-tag any-weapon private', land: 'Private', limit: 'Palouse A tag any-weapon antlerless Aug 1–Sept 15 on/within 1 mi of private agricultural land.' });
      add(['8A'], 'Muzzle', ['2026-12-02', '2026-12-14'], 'Spike or antlerless elk', { type: 'A-tag muzzle 8A', limit: 'Palouse A tag muzzle Unit 8A spike/antlerless Dec 2–14 (spike-only Dec 6–14).' });
      add(['8', '11A'], 'Muzzle', ['2026-12-02', '2026-12-14'], 'Antlerless elk', { type: 'A-tag muzzle private', land: 'Private', limit: 'Palouse A tag muzzle antlerless Units 8,11A Dec 2–14 on/within 1 mi of private agricultural land.' });
      add(['8', '8A', '11A'], 'Gun', ['2026-10-10', '2026-10-24'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Palouse B tag any-weapon antlered Oct 10–24.' });

      add(['10', '12'], 'Archery', ['2026-08-30', '2026-09-30'], 'Antlered elk', { type: 'A-tag archery', limit: 'Lolo A tag archery antlered Aug 30–Sept 30 (capped).' });
      add(['10', '12'], 'Gun', ['2026-10-10', '2026-11-03'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Lolo B tag any-weapon antlered Oct 10–Nov 3 (capped).' });

      add(['10A'], 'Archery', ['2026-08-30', '2026-09-30'], 'Antlered elk', { type: 'A-tag archery', limit: 'Dworshak A tag archery antlered Aug 30–Sept 30 (capped).' });
      add(['10A'], 'Muzzle', ['2026-12-02', '2026-12-14'], 'Antlered elk', { type: 'A-tag muzzle', limit: 'Dworshak A tag muzzleloader antlered Dec 2–14 (capped).' });
      add(['10A'], 'Gun', ['2026-10-10', '2026-11-03'], 'Brow-tined bull elk', { type: 'B-tag any-weapon', limit: 'Dworshak B tag any-weapon brow-tined bulls Oct 10–Nov 3 (capped).' });

      add(['15', '16'], 'Archery', ['2026-08-30', '2026-09-30'], 'Antlered elk', { type: 'A-tag archery', limit: 'Elk City A tag archery antlered Units 15–16 Aug 30–Sept 30 (capped). No second elk tags.' });
      add(['14', '16'], 'Muzzle', ['2026-11-21', '2026-12-05'], 'Antlerless elk', { type: 'A-tag muzzle', limit: 'Elk City A tag muzzle antlerless Units 14,16 Nov 21–Dec 5 (capped).' });
      add(['14', '15', '16'], 'Gun', ['2026-10-10', '2026-10-24'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Elk City B tag any-weapon antlered Oct 10–24 (capped). No second elk tags.' });

      add(['16A', '17', '19', '20'], 'Gun', ['2026-10-01', '2026-10-31'], 'Antlered elk', { type: 'A-tag any-weapon', limit: 'Selway A tag any-weapon antlered Oct 1–31 (capped).' });
      add(['16A', '17', '19', '20'], 'Gun', ['2026-09-15', '2026-09-30'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Selway B tag any-weapon antlered Sept 15–30 (capped).' });
      add(['16A', '17', '19', '20'], 'Gun', ['2026-11-01', '2026-11-11'], 'Antlered elk', { type: 'B-tag any-weapon late', limit: 'Selway B tag any-weapon antlered Nov 1–11 (capped).' });

      add(['20A', '26'], 'Gun', ['2026-10-01', '2026-10-31'], 'Antlered elk', { type: 'A-tag any-weapon', limit: 'Middle Fork A tag Units 20A,26 antlered Oct 1–31 (capped).' });
      add(['27'], 'Gun', ['2026-10-01', '2026-10-31'], 'Brow-tined bull elk', { type: 'A-tag any-weapon', limit: 'Middle Fork A tag Unit 27 brow-tined bulls Oct 1–31 (capped).' });
      add(['20A', '26'], 'Gun', ['2026-09-15', '2026-09-30'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Middle Fork B tag Units 20A,26 antlered Sept 15–30 (capped).' });
      add(['27'], 'Gun', ['2026-09-15', '2026-09-30'], 'Brow-tined bull elk', { type: 'B-tag any-weapon', limit: 'Middle Fork B tag Unit 27 brow-tined bulls Sept 15–30 (capped).' });
      add(['20A', '26'], 'Gun', ['2026-11-01', '2026-11-18'], 'Antlered elk', { type: 'B-tag any-weapon late', limit: 'Middle Fork B tag Units 20A,26 antlered Nov 1–18 (capped).' });
      add(['27'], 'Gun', ['2026-11-01', '2026-11-18'], 'Brow-tined bull elk', { type: 'B-tag any-weapon late', limit: 'Middle Fork B tag Unit 27 brow-tined bulls Nov 1–18 (capped).' });

      add(['21', '21A', '36B'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Salmon A tag archery any elk Units 21,21A,36B Aug 30–Sept 30.' });
      add(['28'], 'Archery', ['2026-12-01', '2026-12-31'], 'Any elk', { type: 'A-tag archery', limit: 'Salmon A tag archery any elk Unit 28 Dec 1–31.' });
      add(['21A'], 'Gun', ['2026-08-01', '2026-10-31'], 'Antlerless elk', { type: 'A-tag private irrigated', land: 'Private', limit: 'Salmon A tag any-weapon antlerless Unit 21A Aug 1–Oct 31 on private irrigated agricultural land.' });
      add(['21', '21A', '28', '36B'], 'Gun', ['2026-10-15', '2026-11-08'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Salmon B tag any-weapon antlered Oct 15–Nov 8 (capped).' });

      add(['22', '32', '32A'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Weiser River A tag archery any elk Aug 30–Sept 30.' });
      add(['32'], 'Gun', ['2026-11-01', '2026-11-15'], 'Antlerless elk', { type: 'A-tag any-weapon', limit: 'Weiser River A tag any-weapon antlerless Unit 32 Nov 1–15. Very limited public access.' });
      add(['32'], 'Gun', ['2026-11-16', '2026-11-30'], 'Antlerless elk', { type: 'A-tag private', land: 'Private', limit: 'Weiser River A tag any-weapon antlerless private land Unit 32 Nov 16–30.' });
      add(['32'], 'Gun', ['2026-08-01', '2026-09-30'], 'Antlerless elk', { type: 'B-tag private', land: 'Private', limit: 'Weiser River B tag any-weapon antlerless private land Unit 32 Aug 1–Sept 30.' });
      add(['32'], 'Gun', ['2026-10-01', '2026-10-31'], 'Antlerless elk', { type: 'B-tag any-weapon', limit: 'Weiser River B tag any-weapon antlerless Unit 32 Oct 1–31. Very limited public access.' });
      add(['22', '32', '32A'], 'Gun', ['2026-10-25', '2026-11-03'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Weiser River B tag any-weapon antlered Oct 25–Nov 3.' });

      add(['19A', '23', '24', '25'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'McCall A tag archery any elk Aug 30–Sept 30.' });
      add(['19A', '23', '24', '25'], 'Gun', ['2026-10-05', '2026-10-14'], 'Spike elk', { type: 'A-tag any-weapon', limit: 'McCall A tag any-weapon spike only Oct 5–14. Short-range in a portion of Unit 24.' });
      add(['19A', '23', '24', '25'], 'Gun', ['2026-10-15', '2026-11-03'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'McCall B tag any-weapon antlered Oct 15–Nov 3.' });

      add(['29', '37', '37A', '51'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Lemhi A tag archery any elk Aug 30–Sept 30. No B tags — controlled only.' });
      add(['29', '37', '37A'], 'Muzzle', ['2026-11-25', '2026-12-09'], 'Antlerless elk', { type: 'A-tag muzzle', limit: 'Lemhi A tag muzzle antlerless Nov 25–Dec 9.' });
      add(['29', '37', '37A'], 'Gun', ['2026-08-01', '2026-10-31'], 'Antlerless elk', { type: 'A-tag private irrigated', land: 'Private', limit: 'Lemhi A tag any-weapon antlerless Aug 1–Oct 31 on/within 1 mi of private irrigated agricultural land.' });

      add(['30', '30A', '58', '59', '59A'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Beaverhead A tag archery any elk Aug 30–Sept 30. No B tags — controlled only.' });
      add(['58', '59', '59A'], 'Muzzle', ['2026-10-15', '2026-10-31'], 'Antlerless elk', { type: 'A-tag muzzle', limit: 'Beaverhead A tag muzzle antlerless Units 58,59,59A Oct 15–31.' });

      add(['31'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Brownlee A tag archery any elk Aug 30–Sept 30.' });
      add(['31'], 'Gun', ['2026-08-15', '2026-09-30'], 'Antlerless elk', { type: 'B-tag private', land: 'Private', limit: 'Brownlee B tag any-weapon antlerless Aug 15–Sept 30 on/within 1 mi of agricultural land outside NFS boundary.' });
      add(['31'], 'Gun', ['2026-11-15', '2026-11-30'], 'Antlerless elk', { type: 'B-tag any-weapon', limit: 'Brownlee B tag any-weapon antlerless Nov 15–30.' });

      add(['33', '34', '35', '36'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Sawtooth A tag archery any elk Aug 30–Sept 30 (capped).' });
      add(['33', '34', '35', '36'], 'Gun', ['2026-10-15', '2026-11-08'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Sawtooth B tag any-weapon antlered Oct 15–Nov 8 (capped).' });

      add(['36A', '49', '50'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Pioneer A tag archery any elk Aug 30–Sept 30.' });
      add(['36A', '49', '50'], 'Muzzle', ['2026-11-01', '2026-11-09'], 'Antlerless elk', { type: 'A-tag muzzle', limit: 'Pioneer A tag muzzle antlerless Nov 1–9.' });
      add(['36A', '49', '50'], 'Gun', ['2026-11-10', '2026-11-30'], 'Antlerless elk', { type: 'B-tag any-weapon', limit: 'Pioneer B tag any-weapon antlerless Nov 10–30 (capped).' });

      /* Owyhee (40-42): controlled hunts only — no general rows. */

      add(['39'], 'Archery', ['2026-11-10', '2026-11-30'], 'Any elk', { type: 'A-tag archery', limit: 'Boise River A tag archery any elk Unit 39 Nov 10–30. Ada County / Mores Creek closed.' });
      add(['39'], 'Gun', ['2026-10-27', '2026-11-09'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Boise River B tag any-weapon antlered Unit 39 Oct 27–Nov 9. Portion south/east of Blacks Creek Rd closed.' });
      add(['38'], 'Gun', ['2026-08-01', '2026-09-30'], 'Any elk', { type: 'B-tag any-weapon', limit: 'Boise River B tag any-weapon any elk Unit 38 Aug 1–Sept 30. Very limited public access.' });
      add(['38'], 'Gun', ['2026-10-01', '2026-12-31'], 'Antlerless or spike elk', { type: 'B-tag any-weapon', limit: 'Boise River B tag any-weapon antlerless or spike Unit 38 Oct 1–Dec 31. Very limited public access.' });

      add(['43', '48'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Smoky-Bennett A tag archery any elk Units 43,48 Aug 30–Sept 30.' });
      add(['44', '45', '52'], 'Gun', ['2026-11-10', '2026-11-24'], 'Antlerless elk', { type: 'B-tag any-weapon', limit: 'Smoky-Bennett B tag any-weapon antlerless Units 44,45,52 Nov 10–24 (capped).' });

      add(['55', '56', '57'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'South Hills A tag archery any elk Units 55–57 Aug 30–Sept 30.' });
      add(['56'], 'Gun', ['2026-10-25', '2026-11-15'], 'Antlerless elk', { type: 'B-tag any-weapon', limit: 'South Hills B tag any-weapon antlerless Unit 56 Oct 25–Nov 15 (capped).' });

      add(['52A', '68'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Big Desert A tag archery any elk Units 52A,68 Aug 30–Sept 30.' });
      add(['68'], 'Archery', ['2026-08-01', '2026-08-30'], 'Any elk', { type: 'A-tag early archery', limit: 'Big Desert A tag archery any elk Unit 68 Aug 1–30.' });
      add(['52A', '68'], 'Gun', ['2026-11-01', '2026-12-31'], 'Antlerless elk', { type: 'B-tag any-weapon', limit: 'Big Desert B tag any-weapon antlerless Units 52A,68 Nov 1–Dec 31 (capped).' });

      add(['60', '60A', '61', '62', '62A'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Island Park A tag archery any elk Aug 30–Sept 30. No B tags — controlled only.' });
      add(['61'], 'Muzzle', ['2026-11-15', '2026-12-09'], 'Spike or antlerless elk', { type: 'A-tag muzzle', limit: 'Island Park A tag muzzle spike or antlerless Unit 61 Nov 15–Dec 9.' });

      add(['64', '65', '67'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Palisades A tag archery any elk Aug 30–Sept 30.' });
      add(['64', '65', '67'], 'Gun', ['2026-10-15', '2026-10-21'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Palisades B tag any-weapon antlered Oct 15–21.' });

      add(['66', '69'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Tex Creek A tag archery any elk Aug 30–Sept 30.' });
      add(['66', '69'], 'Gun', ['2026-10-22', '2026-10-31'], 'Antlerless elk', { type: 'A-tag any-weapon', limit: 'Tex Creek A tag any-weapon antlerless Oct 22–31.' });
      add(['66', '69'], 'Archery', ['2026-08-30', '2026-09-14'], 'Spike or antlerless elk', { type: 'B-tag archery', limit: 'Tex Creek B tag archery spike or antlerless Aug 30–Sept 14.' });
      add(['66', '69'], 'Gun', ['2026-10-15', '2026-10-21'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Tex Creek B tag any-weapon antlered Oct 15–21.' });

      add(['70', '71', '72', '73', '73A', '74'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Bannock A tag archery any elk Aug 30–Sept 30. No B tags — controlled only.' });
      add(['70', '71', '72', '73', '73A', '74'], 'Gun', ['2026-10-25', '2026-11-15'], 'Antlerless elk', { type: 'A-tag any-weapon', limit: 'Bannock A tag any-weapon antlerless Oct 25–Nov 15.' });
      add(['70', '71', '72', '73', '73A', '74'], 'Muzzle', ['2026-12-01', '2026-12-31'], 'Antlerless elk', { type: 'A-tag muzzle', limit: 'Bannock A tag muzzle antlerless Dec 1–31.' });

      add(['75', '77', '78'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Bear River A tag archery any elk Aug 30–Sept 30.' });
      add(['75', '77', '78'], 'Gun', ['2026-10-25', '2026-11-15'], 'Antlerless elk', { type: 'A-tag any-weapon', limit: 'Bear River A tag any-weapon antlerless Oct 25–Nov 15.' });
      add(['75', '77', '78'], 'Muzzle', ['2026-12-01', '2026-12-31'], 'Antlerless elk', { type: 'A-tag muzzle', limit: 'Bear River A tag muzzle antlerless Dec 1–31.' });
      add(['75', '77', '78'], 'Archery', ['2026-08-30', '2026-09-14'], 'Spike or antlerless elk', { type: 'B-tag archery', limit: 'Bear River B tag archery spike or antlerless Aug 30–Sept 14 (capped).' });
      add(['75', '77', '78'], 'Gun', ['2026-10-15', '2026-10-24'], 'Antlered elk', { type: 'B-tag any-weapon', limit: 'Bear River B tag any-weapon antlered Oct 15–24 (capped).' });

      add(['66A', '76'], 'Archery', ['2026-08-30', '2026-09-30'], 'Any elk', { type: 'A-tag archery', limit: 'Diamond Creek A tag archery any elk Aug 30–Sept 30 (capped).' });
      return out;
    }()),

    /* Official ODFW eRegulations Elk Seasons, last updated Mar 31, 2026. General tags only. Controlled 200-series omitted. Unit 48/51 rifle is a portion — omitted. */
    OR: (function () {
      var out = [];
      function add(areas, kind, win, target, extra) {
        extra = extra || {};
        extra.note = ORN;
        out.push(row(areas, kind, win, target, extra));
      }
      add([16, 19, 21, 22, 29, 30], 'Gun', ['2026-11-07', '2026-11-13'], 'Bull elk', { type: 'West Cascade general', limit: 'General West Cascade any-legal Nov 7–13. One bull elk.' });
      add([11, 12, 14, 15, 17, 18, 20, 23, 28], 'Gun', ['2026-11-14', '2026-11-17'], 'Bull elk', { type: 'Coast 1st general', limit: 'General Western Oregon Coast 1st season Nov 14–17. One bull elk.' });
      add([11, 15, 17, 18, 23, 28], 'Gun', ['2026-11-21', '2026-11-27'], 'Bull elk', { type: 'Coast 2nd general bull', limit: 'General Western Oregon Coast 2nd season Nov 21–27. One bull elk.' });
      add([12, 14, 20], 'Gun', ['2026-11-21', '2026-11-27'], 'Spike elk', { type: 'Coast 2nd general spike', limit: 'General Western Oregon Coast 2nd season Nov 21–27. One spike elk.' });
      add([49, 50, 52, 53, 61, 62, 63], 'Gun', ['2026-11-07', '2026-11-15'], 'Spike elk', { type: 'East RM 2nd general', limit: 'General Eastern Oregon Rocky Mountain 2nd season Nov 7–15. One spike elk. Portions of units 48 and 51 omitted.' });
      add([15, 20, 23, 25, 28], 'Archery', ['2026-08-29', '2026-09-27'], 'Elk', { type: 'West archery any', limit: 'General archery Aug 29–Sept 27. One elk.' });
      add([11, 12, 14, 17, 18, 27], 'Archery', ['2026-08-29', '2026-09-27'], 'Bull elk', { type: 'West archery bull', limit: 'General archery Aug 29–Sept 27. One bull elk.' });
      add([16, 19, 21, 22, 29, 30], 'Archery', ['2026-08-29', '2026-09-27'], 'Bull elk', { type: 'West archery bull (NF)', limit: 'General archery Aug 29–Sept 27. One bull elk. Extra any-elk off USFS omitted so forest clicks never show cow.' });
      add([10, 24], 'Archery', ['2026-08-29', '2026-09-27'], '3-point+ bull elk', { type: 'West archery 3pt', limit: 'General archery Aug 29–Sept 27. One bull 3 pt.+.' });
      add([26], 'Archery', ['2026-08-29', '2026-09-27'], 'Spike elk', { type: 'West archery spike', limit: 'General archery Aug 29–Sept 27. One spike only.' });
      add([35, 38, 40, 41, 42, 43, 44, 45, 64, 67, 68, 69, 70, 71, 73], 'Archery', ['2026-08-29', '2026-09-27'], 'Elk', { type: 'East archery any', limit: 'General archery Aug 29–Sept 27. One elk. Portions of units 51, 65, 66, 77 omitted.' });
      add([31, 32, 33, 34, 39, 74, 75, 76], 'Archery', ['2026-08-29', '2026-09-27'], 'Bull elk', { type: 'East archery bull', limit: 'General archery Aug 29–Sept 27. One bull elk. Unit 77 Hwy 97 split omitted.' });
      add([15, 23, 40, 43, 44], 'Gun', ['2026-08-01', '2027-03-31'], 'Antlerless elk', { type: 'Damage tag', land: 'Private', limit: 'General Season Antlerless Elk Damage Tag Aug 1, 2026–Mar 31, 2027. Entire units 15, 23, 40, 43, 44. Nearly 100% private. Other portion-only damage areas omitted.' });
      return out;
    }()),

    /* Official WAC 220-415-050 (2024–2026 elk general seasons) + WDFW eRegulations May 1, 2026. Permit-only / closed GMUs omitted. Master-hunter-only omitted. */
    WA: (function () {
      var out = [];
      var closed = { 157: 1, 418: 1, 437: 1, 485: 1, 490: 1, 522: 1, 556: 1, 621: 1, 636: 1, 653: 1 };
      function seq(a, b) {
        var o = [];
        for (var i = a; i <= b; i++) if (!closed[i]) o.push(i);
        return o;
      }
      function mix() {
        var o = [];
        for (var i = 0; i < arguments.length; i++) {
          var a = arguments[i];
          if (Array.isArray(a)) o = o.concat(a);
          else if (!closed[a]) o.push(a);
        }
        return o;
      }
      function add(areas, kind, win, target, extra) {
        extra = extra || {};
        extra.note = WAN;
        out.push(row(areas, kind, win, target, extra));
      }
      add([101, 105, 108, 111, 113, 117, 121, 204], 'Gun', ['2026-10-31', '2026-11-08'], 'Any bull elk', { type: 'East modern any bull', limit: 'Eastern modern firearm Oct 31–Nov 8. Any bull. EF tag.' });
      add(mix(seq(145, 154), seq(162, 186), 249, seq(336, 368)), 'Gun', ['2026-10-31', '2026-11-08'], 'Spike bull elk', { type: 'East modern spike', limit: 'Eastern modern firearm Oct 31–Nov 8. Spike bull. EF tag.' });
      add([251, 328, 329, 334, 335], 'Gun', ['2026-10-31', '2026-11-08'], 'True spike bull elk', { type: 'East modern true spike', limit: 'Eastern modern firearm Oct 31–Nov 8. True spike bull. EF tag.' });
      add(mix(seq(124, 142), 372, 382, 388), 'Gun', ['2026-10-31', '2026-11-08'], 'Elk', { type: 'East modern any elk', limit: 'Eastern modern firearm Oct 31–Nov 8. Any elk. EF tag. 372/382 mainly private.' });
      add(mix(203, seq(209, 248), 250, seq(254, 290), 373, 379, 381), 'Gun', ['2026-10-31', '2026-11-15'], 'Elk', { type: 'East modern any elk late', limit: 'Eastern modern firearm Oct 31–Nov 15. Any elk. EF tag.' });
      add(mix(407, 448, 460, 466, 503, seq(505, 520), 524, 530, 550, 560, 568, 572, 574, 578, seq(601, 618), 624, 627, 633, 638, seq(642, 651), 652, 654, 658, 660, seq(667, 684)), 'Gun', ['2026-11-07', '2026-11-18'], '3-point min. bull elk', { type: 'West modern 3pt', limit: 'Western modern firearm Nov 7–18. 3 pt. min. WF tag. Elk-area exceptions (5066, 6071, 6064, 6014) not drawn.' });
      add([501, 504, 663], 'Gun', ['2026-11-07', '2026-11-18'], '3-point min. or antlerless elk', { type: 'West modern 3pt/antlerless', limit: 'Western modern firearm Nov 7–18. 3 pt. min. or antlerless. WF tag.' });
      add([564, 666], 'Gun', ['2026-11-07', '2026-11-18'], 'Elk', { type: 'West modern any elk', limit: 'Western modern firearm Nov 7–18. Any elk. WF tag.' });
      add([454], 'Gun', ['2026-11-07', '2026-11-18'], 'Any bull elk', { type: 'West modern any bull', limit: 'Western modern firearm Nov 7–18. Any bull. WF tag.' });

      add(mix(seq(101, 142), 204, 243, 247, 249, 250, 272, 278, 284, 290, 373, 379, 381, 382, 388), 'Archery', ['2026-09-12', '2026-09-24'], 'Elk', { type: 'East early archery any', limit: 'Eastern early archery Sept 12–24. Any elk. EA tag.' });
      add(mix(154, 162, 166, 169, 172, 175, 186, 251, 328, 329, 336, 340, 352, 356, 364), 'Archery', ['2026-09-12', '2026-09-24'], 'Spike bull elk', { type: 'East early archery spike', limit: 'Eastern early archery Sept 12–24. Spike bull. EA tag.' });
      add(mix(145, 149, 163, 178, 181, 334, 335, 371), 'Archery', ['2026-09-12', '2026-09-24'], 'Spike bull or antlerless elk', { type: 'East early archery spike/antlerless', limit: 'Eastern early archery Sept 12–24. Spike bull or antlerless. EA tag. Elk Area 1054 omitted.' });
      add(mix(454, 564, 666, 684), 'Archery', ['2026-09-12', '2026-09-24'], 'Elk', { type: 'West early archery any', limit: 'Western early archery Sept 12–24. Any elk. WA tag.' });
      add(mix(seq(501, 505), 554, 568, 574, 578, 652, 654, 660, 663, seq(667, 673), 681, 699), 'Archery', ['2026-09-12', '2026-09-24'], '3-point min. or antlerless elk', { type: 'West early archery 3pt/antlerless', limit: 'Western early archery Sept 12–24. 3 pt. min. or antlerless. WA tag. Elk areas 4601/6061 omitted.' });
      add(mix(407, 448, 460, 466, seq(506, 520), 524, 530, 550, 560, 572, seq(601, 618), 624, 627, 633, 638, seq(642, 651), 658), 'Archery', ['2026-09-12', '2026-09-24'], '3-point min. bull elk', { type: 'West early archery 3pt', limit: 'Western early archery Sept 12–24. 3 pt. min. WA tag.' });

      add([101, 105, 108, 117, 204], 'Archery', ['2026-11-25', '2026-12-08'], 'Any bull elk', { type: 'East late archery any bull', limit: 'Eastern late archery Nov 25–Dec 8. Any bull. EA tag.' });
      add([121, 124, 127, 373, 382, 388], 'Archery', ['2026-11-25', '2026-12-08'], 'Elk', { type: 'East late archery any elk', limit: 'Eastern late archery Nov 25–Dec 8. Any elk. EA tag.' });
      add(mix(203, seq(209, 248), 250, seq(254, 290), 379, 381), 'Archery', ['2026-10-31', '2026-11-15'], 'Elk', { type: 'East late archery overlap modern', limit: 'Eastern late archery Oct 31–Nov 15 (hunter orange). Any elk. EA tag.' });
      add([249, 251, 336, 342, 346, 352, 364], 'Archery', ['2026-11-25', '2026-12-08'], 'Spike bull elk', { type: 'East late archery spike', limit: 'Eastern late archery Nov 25–Dec 8. Spike bull. EA tag. Elk Area 3681 omitted.' });
      add([334, 335], 'Archery', ['2026-11-25', '2026-12-08'], 'Spike bull or antlerless elk', { type: 'East late archery spike/antlerless', limit: 'Eastern late archery Nov 25–Dec 8. Spike bull or antlerless. EA tag.' });
      add(mix(454, 564, 666), 'Archery', ['2026-11-25', '2026-12-15'], 'Elk', { type: 'West late archery any', limit: 'Western late archery Nov 25–Dec 15. Any elk. WA tag.' });
      add(mix(503, 505, 652, 663, 667, 672, 681, 699), 'Archery', ['2026-11-25', '2026-12-15'], '3-point min. or antlerless elk', { type: 'West late archery 3pt/antlerless', limit: 'Western late archery Nov 25–Dec 15. 3 pt. min. or antlerless. WA tag.' });
      add(mix(407, 448, 506, 530, 603, 612, 615, 638, 648), 'Archery', ['2026-11-25', '2026-12-15'], '3-point min. bull elk', { type: 'West late archery 3pt', limit: 'Western late archery Nov 25–Dec 15. 3 pt. min. WA tag.' });

      add(mix(seq(101, 121), 204, 247), 'Muzzle', ['2026-10-03', '2026-10-09'], 'Any bull elk', { type: 'East early muzzle any bull', limit: 'Eastern early muzzleloader Oct 3–9. Any bull. EM tag.' });
      add(mix(seq(124, 142), 245, 250, 272, 278, 284, 290, 379), 'Muzzle', ['2026-10-03', '2026-10-09'], 'Elk', { type: 'East early muzzle any elk', limit: 'Eastern early muzzleloader Oct 3–9. Any elk. EM tag.' });
      add(mix(145, 149, 154, 162, 163, 166, 172, 175, 178, 181, 249, seq(336, 342), seq(352, 368)), 'Muzzle', ['2026-10-03', '2026-10-09'], 'Spike bull elk', { type: 'East early muzzle spike', limit: 'Eastern early muzzleloader Oct 3–9. Spike bull. EM tag.' });
      add([251, 328, 329, 334, 335], 'Muzzle', ['2026-10-03', '2026-10-09'], 'True spike bull elk', { type: 'East early muzzle true spike', limit: 'Eastern early muzzleloader Oct 3–9. True spike bull. EM tag. Elk Area 2051 omitted.' });
      add([454, 564, 666, 684], 'Muzzle', ['2026-10-03', '2026-10-09'], 'Elk', { type: 'West early muzzle any', limit: 'Western early muzzleloader Oct 3–9. Any elk. WM tag.' });
      add(mix(407, 448, 460, 466, 506, 510, 513, 516, 520, 524, 530, 550, 554, 560, 568, 572, 574, 578, 602, 603, 607, 612, 615, 624, 627, 633, 638, 642, 648, 660, 672, 673, 681), 'Muzzle', ['2026-10-03', '2026-10-09'], '3-point min. bull elk', { type: 'West early muzzle 3pt', limit: 'Western early muzzleloader Oct 3–9. 3 pt. min. WM tag.' });
      add(mix(501, 503, 504, 505, 652, 654, 663, 667), 'Muzzle', ['2026-10-03', '2026-10-09'], '3-point min. or antlerless elk', { type: 'West early muzzle 3pt/antlerless', limit: 'Western early muzzleloader Oct 3–9. 3 pt. min. or antlerless. WM tag.' });
      add(seq(130, 142), 'Muzzle', ['2026-11-25', '2026-12-08'], 'Elk', { type: 'East late muzzle any elk', limit: 'Eastern late muzzleloader Nov 25–Dec 8. Any elk. EM tag.' });
      add(mix(203, seq(209, 248), 250, seq(254, 290), 373, 379, 381), 'Muzzle', ['2026-10-31', '2026-11-15'], 'Elk', { type: 'East late muzzle overlap modern', limit: 'Eastern late muzzleloader Oct 31–Nov 15 (hunter orange). Any elk. EM tag.' });
      add(mix(501, 503, 504, 505, 652, 667), 'Muzzle', ['2026-11-25', '2026-12-08'], '3-point min. or antlerless elk', { type: 'West late muzzle 3pt/antlerless', limit: 'Western late muzzleloader Nov 25–Dec 8. 3 pt. min. or antlerless. WM tag.' });
      add(mix(454, 564, 666, 684), 'Muzzle', ['2026-11-25', '2026-12-15'], 'Elk', { type: 'West late muzzle any', limit: 'Western late muzzleloader Nov 25–Dec 15. Any elk. WM tag.' });
      add([568, 574, 578], 'Muzzle', ['2026-11-25', '2026-11-30'], '3-point min. bull elk', { type: 'West late muzzle 3pt short', limit: 'Western late muzzleloader Nov 25–30. 3 pt. min. WM tag.' });
      add(mix(448, 601, 618, 651, 658), 'Muzzle', ['2026-11-25', '2026-12-15'], '3-point min. bull elk', { type: 'West late muzzle 3pt', limit: 'Western late muzzleloader Nov 25–Dec 15. 3 pt. min. WM tag.' });
      add([407], 'Muzzle', ['2026-12-16', '2026-12-31'], '3-point min. bull elk', { type: 'West late muzzle 407', limit: 'Western late muzzleloader Dec 16–31 GMU 407. 3 pt. min. WM tag.' });
      return out;
    }()),

    /* Official NDOW eRegulations Elk Hunting, last updated May 27, 2026 (NAC 502.361). Draw-only. Antlered hunts encoded. Spike / antlerless / depredation omitted (separate tags). */
    NV: (function () {
      var out = [];
      function pad(n) {
        var s = String(n);
        while (s.length < 3) s = '0' + s;
        return s;
      }
      function span(a, b) {
        var o = [];
        for (var i = a; i <= b; i++) o.push(pad(i));
        return o;
      }
      function u() {
        var o = [];
        for (var i = 0; i < arguments.length; i++) {
          var a = arguments[i];
          if (Array.isArray(a)) o = o.concat(a);
          else o.push(pad(a));
        }
        return o;
      }
      function add(areas, kind, win, target, extra) {
        extra = extra || {};
        extra.note = NVN;
        out.push(row(areas, kind, win, target, extra));
      }
      add(u(51, 262), 'Gun', ['2026-09-17', '2026-09-30'], 'Antlered elk (draw)', { type: 'Antlered any-legal', limit: 'Units 051, 262 antlered any-legal Sept 17–30. Draw tag required.' });
      add(u(61, 71), 'Gun', ['2026-10-05', '2026-10-21'], 'Antlered elk (draw)', { type: 'Antlered any-legal early', limit: 'Units 061, 071 early antlered any-legal Oct 5–21. Draw tag required.' });
      add(u(61, 71), 'Gun', ['2026-10-22', '2026-11-05'], 'Antlered elk (draw)', { type: 'Antlered any-legal late', limit: 'Units 061, 071 late antlered any-legal Oct 22–Nov 5. Draw tag required.' });
      add(u(62, 64, span(66, 68)), 'Gun', ['2026-10-22', '2026-11-05'], 'Antlered elk (draw)', { type: 'Antlered any-legal', limit: 'Units 062, 064, 066–068 antlered any-legal Oct 22–Nov 5. Draw tag required.' });
      add(u(72, 73, 74, 75, 78, span(105, 107), 109), 'Gun', ['2026-10-22', '2026-11-05'], 'Antlered elk (draw)', { type: 'Antlered any-legal early', limit: 'Early antlered any-legal Oct 22–Nov 5. Draw tag required.' });
      add(u(72, 73, 74, 75, 78, span(105, 107), 109), 'Gun', ['2026-11-06', '2026-11-20'], 'Antlered elk (draw)', { type: 'Antlered any-legal late', limit: 'Late antlered any-legal Nov 6–20. Draw tag required.' });
      add(u(76, 77, 79, 81, 104, 108, 121, span(111, 115), span(161, 164), span(171, 173), span(221, 223), 231, 241, 242, 131, 132), 'Gun', ['2026-11-06', '2026-11-20'], 'Antlered elk (draw)', { type: 'Antlered any-legal early', limit: 'Early antlered any-legal Nov 6–20. Draw tag required. Unit 108 is a north/south powerline split.' });
      add(u(76, 77, 79, 81, 104, 108, 121, span(111, 115), span(161, 164), span(171, 173), span(221, 223), 231, 131, 132), 'Gun', ['2026-11-21', '2026-12-04'], 'Antlered elk (draw)', { type: 'Antlered any-legal late', limit: 'Late antlered any-legal Nov 21–Dec 4. Draw tag required.' });
      add(u(91), 'Gun', ['2026-09-12', '2026-10-02'], 'Antlered elk (draw)', { type: 'Antlered any-legal interstate', limit: 'Unit 091 interstate with Utah Sept 12–Oct 2. Draw tag required.' });

      add(u(61, 71, 62, 64, span(66, 68)), 'Archery', ['2026-08-16', '2026-08-31'], 'Antlered elk (draw)', { type: 'Antlered archery', limit: 'Antlered archery Aug 16–31. Draw tag required.' });
      add(u(72, 73, 74, 75, 76, 77, 79, 81, 104, 108, 121, span(111, 115), span(161, 164), span(171, 173), span(221, 223), 231, 241, 242, 262, 131, 132), 'Archery', ['2026-08-25', '2026-09-16'], 'Antlered elk (draw)', { type: 'Antlered archery', limit: 'Antlered archery Aug 25–Sept 16. Draw tag required.' });
      add(u(78, span(105, 107), 109), 'Archery', ['2026-09-01', '2026-09-20'], 'Antlered elk (draw)', { type: 'Antlered archery', limit: 'Antlered archery Sept 1–20. Draw tag required.' });
      add(u(91), 'Archery', ['2026-08-15', '2026-09-06'], 'Antlered elk (draw)', { type: 'Antlered archery interstate', limit: 'Unit 091 archery Aug 15–Sept 6. Draw tag required.' });

      add(u(51, 61, 71, 62, 64, span(66, 68)), 'Muzzle', ['2026-09-01', '2026-09-16'], 'Antlered elk (draw)', { type: 'Antlered muzzle', limit: 'Antlered muzzleloader Sept 1–16. Draw tag required.' });
      add(u(span(161, 164), span(171, 173), 241, 242), 'Muzzle', ['2026-09-17', '2026-09-30'], 'Antlered elk (draw)', { type: 'Antlered muzzle', limit: 'Antlered muzzleloader Sept 17–30. Draw tag required.' });
      add(u(72, 73, 74, 75, 78, span(105, 107), 109), 'Muzzle', ['2026-10-05', '2026-10-21'], 'Antlered elk (draw)', { type: 'Antlered muzzle', limit: 'Antlered muzzleloader Oct 5–21. Draw tag required.' });
      add(u(76, 77, 79, 81, 104, 108, 121, span(111, 115), span(221, 223), 231, 262, 131, 132), 'Muzzle', ['2026-10-22', '2026-11-05'], 'Antlered elk (draw)', { type: 'Antlered muzzle', limit: 'Antlered muzzleloader Oct 22–Nov 5. Draw tag required.' });
      return out;
    }()),

    /* Official 301 KAR 2:132 Section 9 (filed Mar 10, 2025) date formulas applied to 2026–27. Quota hunt inside the 16-county restoration zone only. Out-of-zone follows deer seasons — not encoded as statewide elk. */
    KY: [
      row(KYZ, 'Archery', ['2026-09-12', '2026-09-25'], 'Either-sex elk (quota)', { type: 'Archery/crossbow early', limit: 'KAR 2:132 §9: second Saturday in Sept through fourth Friday in Sept (Sept 12–25, 2026). Drawn either-sex archery/crossbow permit. 16-county zone only.' }),
      row(KYZ, 'Archery', ['2026-12-05', '2026-12-11'], 'Either-sex elk (quota)', { type: 'Archery/crossbow late', limit: 'KAR 2:132 §9: first Saturday in Dec through second Friday in Dec (Dec 5–11, 2026). Drawn either-sex archery/crossbow permit.' }),
      row(KYZ, 'Firearm', ['2026-09-26', '2026-09-30'], 'Antlered elk (quota)', { type: 'Bull firearm week 1', limit: 'KAR 2:132 §9: last Saturday in Sept for five consecutive days (Sept 26–30, 2026). Drawn antlered firearms permit; hunter is assigned one of the two weeks. Any legal equipment (including muzzleloader) is allowed on a firearms permit.' }),
      row(KYZ, 'Muzzle', ['2026-09-26', '2026-09-30'], 'Antlered elk (quota)', { type: 'Bull firearm week 1 muzzle', limit: 'Same bull week as firearms permit (KAR 2:132 §8(12) any legal equipment). Assigned week only.' }),
      row(KYZ, 'Firearm', ['2026-10-03', '2026-10-07'], 'Antlered elk (quota)', { type: 'Bull firearm week 2', limit: 'KAR 2:132 §9: first Saturday in Oct for five consecutive days (Oct 3–7, 2026). Drawn antlered firearms permit; hunter is assigned one of the two weeks. Any legal equipment (including muzzleloader) is allowed on a firearms permit.' }),
      row(KYZ, 'Muzzle', ['2026-10-03', '2026-10-07'], 'Antlered elk (quota)', { type: 'Bull firearm week 2 muzzle', limit: 'Same bull week as firearms permit (KAR 2:132 §8(12) any legal equipment). Assigned week only.' }),
      row(KYZ, 'Firearm', ['2026-11-28', '2026-12-02'], 'Antlerless elk (quota)', { type: 'Cow firearm week 1', limit: 'KAR 2:132 §9: last Saturday in Nov for five consecutive days (Nov 28–Dec 2, 2026). Drawn antlerless firearms permit; hunter is assigned one of the two weeks. Any legal equipment (including muzzleloader) is allowed on a firearms permit.' }),
      row(KYZ, 'Muzzle', ['2026-11-28', '2026-12-02'], 'Antlerless elk (quota)', { type: 'Cow firearm week 1 muzzle', limit: 'Same cow week as firearms permit (KAR 2:132 §8(12) any legal equipment). Assigned week only.' }),
      row(KYZ, 'Firearm', ['2027-01-02', '2027-01-06'], 'Antlerless elk (quota)', { type: 'Cow firearm week 2', limit: 'KAR 2:132 §9: first Saturday in Jan for five consecutive days (Jan 2–6, 2027). Drawn antlerless firearms permit; hunter is assigned one of the two weeks. Any legal equipment (including muzzleloader) is allowed on a firearms permit.' }),
      row(KYZ, 'Muzzle', ['2027-01-02', '2027-01-06'], 'Antlerless elk (quota)', { type: 'Cow firearm week 2 muzzle', limit: 'Same cow week as firearms permit (KAR 2:132 §8(12) any legal equipment). Assigned week only.' })
    ],

    /* WGFD Chapter 7 2026. Overlay uses ElkHuntAreas GIS (not deer hunt areas). Closed areas 72 and 79 have no rows. */
    WY: (function () {
      var out = [];
      function add(areas, kind, win, target, extra) {
        extra = extra || {};
        extra.note = WYN;
        out.push(row(areas, kind, win, target, extra));
      }
      add([1], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'Type 1', limit: 'Area 1 Type 1 special archery Sep 1–30. Quota 100 any elk.' });
      add([1], 'Gun', ['2026-10-15', '2026-11-30'], 'Any elk', { type: 'Type 1', limit: 'Area 1 Type 1 regular Oct 15–Nov 30. Quota 100 any elk.' });
      add([2], 'Archery', ['2026-09-20', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 2 general special archery Sep 20–30.' });
      add([2], 'Gun', ['2026-10-01', '2026-10-20'], 'Any elk', { type: 'General', limit: 'Area 2 general regular Oct 1–20 any elk; Oct 21–Nov 15 antlerless not encoded as any-elk.' });
      add([3], 'Archery', ['2026-09-01', '2026-09-14'], 'Any elk', { type: 'General', limit: 'Area 3 general special archery Sep 1–14.' });
      add([3], 'Gun', ['2026-09-15', '2026-11-30'], 'Any elk', { type: 'General', limit: 'Area 3 general regular Sep 15–Nov 30 any elk.' });
      add([6], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', land: 'OffNF', limit: 'Area 6 general special archery Sep 1–30. Regular any elk Oct 1–31 valid off national forest.' });
      add([6], 'Gun', ['2026-10-01', '2026-10-31'], 'Any elk', { type: 'General', land: 'OffNF', limit: 'Area 6 general regular Oct 1–31 any elk valid off national forest.' });
      add([7], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'Type 1', limit: 'Area 7 Type 1 special archery Sep 1–30. Quota 1500 any elk.' });
      add([7], 'Gun', ['2026-10-15', '2026-11-20'], 'Any elk', { type: 'Type 1', limit: 'Area 7 Type 1 regular Oct 15–Nov 20 any elk; later antlerless not encoded as any-elk.' });
      add([9], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 9 general special archery Sep 1–30.' });
      add([9], 'Gun', ['2026-10-15', '2026-10-31'], 'Any elk', { type: 'General', limit: 'Area 9 general regular Oct 15–31 any elk.' });
      add([10], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 10 general special archery Sep 1–30.' });
      add([10], 'Gun', ['2026-10-15', '2026-10-31'], 'Any elk', { type: 'General', limit: 'Area 10 general regular Oct 15–31 any elk.' });
      add([12], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 12 general special archery Sep 1–30.' });
      add([12], 'Gun', ['2026-10-15', '2026-10-31'], 'Any elk', { type: 'General', limit: 'Area 12 general regular Oct 15–31 any elk.' });
      add([13], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 13 general special archery Sep 1–30.' });
      add([13], 'Gun', ['2026-10-15', '2026-10-31'], 'Any elk', { type: 'General', limit: 'Area 13 general regular Oct 15–31 any elk.' });
      add([15], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 15 general special archery Sep 1–30.' });
      add([15], 'Gun', ['2026-10-15', '2026-10-31'], 'Any elk', { type: 'General', limit: 'Area 15 general regular Oct 15–31 any elk.' });
      add([21], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 21 general special archery Sep 1–30.' });
      add([21], 'Gun', ['2026-10-15', '2026-10-31'], 'Any elk', { type: 'General', limit: 'Area 21 general regular Oct 15–31 any elk. Youth extra Oct 11–12 omitted.' });
      add([28], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 28 general special archery Sep 1–30.' });
      add([28], 'Gun', ['2026-10-01', '2026-10-14'], 'Any elk', { type: 'General', limit: 'Area 28 general regular Oct 1–14 any elk.' });
      add([56], 'Archery', ['2026-09-01', '2026-09-30'], 'Any elk', { type: 'General', limit: 'Area 56 general special archery Sep 1–30.' });
      add([56], 'Gun', ['2026-10-01', '2026-10-21'], 'Any elk', { type: 'General', limit: 'Area 56 general regular Oct 1–21 any elk.' });
      return out;
    }())
  };

  /* Colorado uses a custom pack (not pack-lib merge). Seasons are added in co-pack.js. */
  window.RS_ELK_SEASONS.CO_NOTE = CON;

  /* Admin-code / commission-order URLs for Rules & regs when Elk is selected (Alabama pattern: law + agency digest). */
  window.RS_ELK_SOURCES = {
    ID: {
      lawLabel: 'IDAPA 13.01.08 — Taking of Big Game Animals',
      lawUrl: 'https://adminrules.idaho.gov/rules/current/13/130108.pdf',
      agencyLabel: 'IDFG 2026 Big Game Seasons & Rules — elk',
      agencyUrl: 'https://idfg.idaho.gov/sites/default/files/seasons-rules-big-game-2026.pdf'
    },
    CO: {
      lawLabel: '2 CCR 406-2 — Big Game',
      lawUrl: 'https://www.sos.state.co.us/CCR/DisplayRule.do?deptID=16&agencyID=147',
      agencyLabel: 'CPW 2026 Big Game brochure — elk',
      agencyUrl: 'https://cpw.widen.net/s/5wvx7rggrd/colorado-big-game-hunting-brochure'
    },
    UT: {
      lawLabel: 'Utah Admin. Code R657-5 — Taking Big Game',
      lawUrl: 'https://adminrules.utah.gov/public/rule/R657-5/Current%20Rules',
      agencyLabel: 'Utah DWR 2026 Field Regulations Guidebook',
      agencyUrl: 'https://wildlife.utah.gov/guidebooks/field_regs.pdf'
    },
    MT: {
      lawLabel: 'ARM Title 12 — Fish, Wildlife & Parks',
      lawUrl: 'https://rules.mt.gov/browse/collections/aec52c46-1281-4273-afab-c84844c4c4c3/records/title-12',
      agencyLabel: 'FWP 2026 Deer Elk Antelope regulations',
      agencyUrl: 'https://fwp.mt.gov/binaries/content/assets/fwp/hunt/regulations/2026/2026-dea-regulations-final-with-low-resolution-maps-for-web.pdf'
    },
    OR: {
      lawLabel: 'OAR 635-065 — Game Mammal General Seasons',
      lawUrl: 'https://secure.sos.state.or.us/oard/displayDivisionRules.action?selectedDivision=2896',
      agencyLabel: 'ODFW 2026 Elk Seasons (eRegulations, updated Mar 31, 2026)',
      agencyUrl: 'https://www.eregulations.com/oregon/hunting/elk-seasons'
    },
    WA: {
      lawLabel: 'WAC 220-415-050 — 2024-2026 Elk general seasons',
      lawUrl: 'https://app.leg.wa.gov/wac/default.aspx?cite=220-415-050',
      agencyLabel: 'WDFW 2026 Elk General Seasons (eRegulations, updated May 1, 2026)',
      agencyUrl: 'https://www.eregulations.com/washington/hunting/elk-general-seasons'
    },
    NV: {
      lawLabel: 'NAC 502.361 — Elk tags; seasons; quotas',
      lawUrl: 'https://www.leg.state.nv.us/nac/NAC-502.html#NAC502Sec361',
      agencyLabel: 'NDOW 2026-27 Elk Hunting (eRegulations, updated May 27, 2026)',
      agencyUrl: 'https://www.eregulations.com/nevada/hunting/big-game/elk-hunting'
    },
    KY: {
      lawLabel: '301 KAR 2:132 — Elk hunting seasons, permits, zones',
      lawUrl: 'https://apps.legislature.ky.gov/law/kar/titles/301/002/132/',
      agencyLabel: 'KDFWR Elk Hunting Regulations',
      agencyUrl: 'https://fw.ky.gov/Hunt/Pages/Elk-Hunting-Regs.aspx'
    },
    PA: {
      lawLabel: '58 Pa. Code § 139.4 — Seasons and bag limits',
      lawUrl: 'https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/058/chapter139/s139.4.html',
      agencyLabel: 'PGC 2026-27 Seasons and Bag Limits — elk',
      agencyUrl: 'https://www.pa.gov/agencies/pgc/huntingandtrapping/regulations/seasons-and-bag-limits'
    },
    AZ: {
      lawLabel: 'AZGFD Commission Order 26 — Elk (2026-27 Hunting Regulations PDF)',
      lawUrl: 'https://azgfd-portal-wordpress-pantheon.s3.us-west-2.amazonaws.com/wp-content/uploads/2026/05/04081122/2026-27-Arizona-Hunting-Regulations.pdf',
      agencyLabel: 'AZGFD hunting regulations',
      agencyUrl: 'https://www.azgfd.com/hunting/regulations/'
    },
    NM: {
      lawLabel: '19.31.8 NMAC — Elk',
      lawUrl: 'https://www.srca.nm.gov/parts/title19/19.031.0008.html',
      agencyLabel: 'NMDOW hunting publications',
      agencyUrl: 'https://wildlife.dgf.nm.gov/home/publications/'
    },
    WY: {
      lawLabel: 'WGFD Chapter 7 — Elk Hunting Seasons',
      lawUrl: 'https://wgfd.wyo.gov/media/33695/download?inline',
      agencyLabel: 'WGFD elk hunting',
      agencyUrl: 'https://wgfd.wyo.gov/Hunting/Hunt-Planner/elk-hunting'
    },
    CA: {
      lawLabel: '14 CCR § 364 — Elk',
      lawUrl: 'https://govt.westlaw.com/calregs/Document/I1D8B1E80D64E11DE8879F88E8B0DAAAE',
      agencyLabel: 'CDFW elk hunting',
      agencyUrl: 'https://wildlife.ca.gov/Hunting/Elk'
    }
  };
})();
