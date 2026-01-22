import type { City } from '$lib/types/timezone';

// Import cities by country
import aeCities from './ae.json';
import amCities from './am.json';
import aoCities from './ao.json';
import arCities from './ar.json';
import atCities from './at.json';
import auCities from './au.json';
import azCities from './az.json';
import bdCities from './bd.json';
import beCities from './be.json';
import bgCities from './bg.json';
import boCities from './bo.json';
import brCities from './br.json';
import caCities from './ca.json';
import cdCities from './cd.json';
import chCities from './ch.json';
import ciCities from './ci.json';
import clCities from './cl.json';
import cnCities from './cn.json';
import coCities from './co.json';
import crCities from './cr.json';
import cuCities from './cu.json';
import czCities from './cz.json';
import deCities from './de.json';
import dkCities from './dk.json';
import dzCities from './dz.json';
import ecCities from './ec.json';
import egCities from './eg.json';
import esCities from './es.json';
import etCities from './et.json';
import fiCities from './fi.json';
import frCities from './fr.json';
import gbCities from './gb.json';
import geCities from './ge.json';
import ghCities from './gh.json';
import grCities from './gr.json';
import gtCities from './gt.json';
import hkCities from './hk.json';
import hrCities from './hr.json';
import huCities from './hu.json';
import idCities from './id.json';
import ieCities from './ie.json';
import ilCities from './il.json';
import inCities from './in.json';
import iqCities from './iq.json';
import irCities from './ir.json';
import isCities from './is.json';
import itCities from './it.json';
import jpCities from './jp.json';
import keCities from './ke.json';
import khCities from './kh.json';
import krCities from './kr.json';
import kwCities from './kw.json';
import kzCities from './kz.json';
import laCities from './la.json';
import lkCities from './lk.json';
import maCities from './ma.json';
import mmCities from './mm.json';
import mnCities from './mn.json';
import mxCities from './mx.json';
import myCities from './my.json';
import ngCities from './ng.json';
import nlCities from './nl.json';
import noCities from './no.json';
import npCities from './np.json';
import nzCities from './nz.json';
import omCities from './om.json';
import paCities from './pa.json';
import peCities from './pe.json';
import phCities from './ph.json';
import pkCities from './pk.json';
import plCities from './pl.json';
import prCities from './pr.json';
import ptCities from './pt.json';
import pyCities from './py.json';
import qaCities from './qa.json';
import roCities from './ro.json';
import rsCities from './rs.json';
import ruCities from './ru.json';
import saCities from './sa.json';
import seCities from './se.json';
import sgCities from './sg.json';
import snCities from './sn.json';
import thCities from './th.json';
import tnCities from './tn.json';
import trCities from './tr.json';
import twCities from './tw.json';
import tzCities from './tz.json';
import uaCities from './ua.json';
import ugCities from './ug.json';
import usCities from './us.json';
import uyCities from './uy.json';
import uzCities from './uz.json';
import veCities from './ve.json';
import vnCities from './vn.json';
import zaCities from './za.json';

/**
 * All cities grouped by country code
 */
export const citiesByCountry: Record<string, City[]> = {
	AE: aeCities as City[],
	AM: amCities as City[],
	AO: aoCities as City[],
	AR: arCities as City[],
	AT: atCities as City[],
	AU: auCities as City[],
	AZ: azCities as City[],
	BD: bdCities as City[],
	BE: beCities as City[],
	BG: bgCities as City[],
	BO: boCities as City[],
	BR: brCities as City[],
	CA: caCities as City[],
	CD: cdCities as City[],
	CH: chCities as City[],
	CI: ciCities as City[],
	CL: clCities as City[],
	CN: cnCities as City[],
	CO: coCities as City[],
	CR: crCities as City[],
	CU: cuCities as City[],
	CZ: czCities as City[],
	DE: deCities as City[],
	DK: dkCities as City[],
	DZ: dzCities as City[],
	EC: ecCities as City[],
	EG: egCities as City[],
	ES: esCities as City[],
	ET: etCities as City[],
	FI: fiCities as City[],
	FR: frCities as City[],
	GB: gbCities as City[],
	GE: geCities as City[],
	GH: ghCities as City[],
	GR: grCities as City[],
	GT: gtCities as City[],
	HK: hkCities as City[],
	HR: hrCities as City[],
	HU: huCities as City[],
	ID: idCities as City[],
	IE: ieCities as City[],
	IL: ilCities as City[],
	IN: inCities as City[],
	IQ: iqCities as City[],
	IR: irCities as City[],
	IS: isCities as City[],
	IT: itCities as City[],
	JP: jpCities as City[],
	KE: keCities as City[],
	KH: khCities as City[],
	KR: krCities as City[],
	KW: kwCities as City[],
	KZ: kzCities as City[],
	LA: laCities as City[],
	LK: lkCities as City[],
	MA: maCities as City[],
	MM: mmCities as City[],
	MN: mnCities as City[],
	MX: mxCities as City[],
	MY: myCities as City[],
	NG: ngCities as City[],
	NL: nlCities as City[],
	NO: noCities as City[],
	NP: npCities as City[],
	NZ: nzCities as City[],
	OM: omCities as City[],
	PA: paCities as City[],
	PE: peCities as City[],
	PH: phCities as City[],
	PK: pkCities as City[],
	PL: plCities as City[],
	PR: prCities as City[],
	PT: ptCities as City[],
	PY: pyCities as City[],
	QA: qaCities as City[],
	RO: roCities as City[],
	RS: rsCities as City[],
	RU: ruCities as City[],
	SA: saCities as City[],
	SE: seCities as City[],
	SG: sgCities as City[],
	SN: snCities as City[],
	TH: thCities as City[],
	TN: tnCities as City[],
	TR: trCities as City[],
	TW: twCities as City[],
	TZ: tzCities as City[],
	UA: uaCities as City[],
	UG: ugCities as City[],
	US: usCities as City[],
	UY: uyCities as City[],
	UZ: uzCities as City[],
	VE: veCities as City[],
	VN: vnCities as City[],
	ZA: zaCities as City[]
};

/**
 * Get all cities as a flat array
 */
export function getAllCities(): City[] {
	return Object.values(citiesByCountry).flat();
}

/**
 * Get cities for a specific country
 */
export function getCitiesByCountry(countryCode: string): City[] {
	return citiesByCountry[countryCode.toUpperCase()] || [];
}
