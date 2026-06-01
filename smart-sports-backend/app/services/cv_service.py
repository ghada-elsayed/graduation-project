# app/services/cv_service.py
import re
import io
import pandas as pd
import numpy as np
import pdfplumber
import docx
import spacy

nlp = spacy.load("en_core_web_sm")

# =========================
# كلمات المهارات الرياضية
# =========================
skill_keywords = {
    'passing': ['passing','pass','assist','playmaking','through ball','cross','distribution'],
    'shooting': ['shooting','shoot','finishing','goal','scoring','volley','strike'],
    'dribbling': ['dribbling','dribble','ball control','take on'],
    'defending': ['defending','tackle','marking','interception','clearance','block'],
    'pace': ['speed','pace','fast','quick','sprint','acceleration'],
    'movement_acceleration': ['acceleration','burst'],
    'movement_sprint_speed': ['sprint speed','top speed'],
    'physic': ['strength','stamina','fitness','endurance','athletic'],
    'power_strength': ['strength','power','strong'],
    'power_stamina': ['stamina','endurance','work rate'],
    'power_jumping': ['jump','heading','aerial','leap'],
    'mentality_aggression': ['aggressive','competitive','determined'],
    'mentality_positioning': ['positioning','tactical awareness','reading the game'],
    'mentality_vision': ['vision','anticipate','playmaking'],
    'teamwork': ['teamwork','team player','leadership','communication'],
    'tactics': ['tactical','strategy','decision making','game intelligence']
}

# =========================
# position weights من الـ notebook الأصلي
# =========================
position_weights = {
    'RW': {'age': 0.0018336422106115578, 'height_cm': 0.0013078292933987475, 'weight_kg': 0.0016456998685170086, 'pace': 0.0029986835128106314, 'shooting': 0.017208769657383695, 'passing': 0.09317898572207402, 'dribbling': 0.8019996457513994, 'defending': 0.001744337094380121, 'physic': 0.0022993030095048344, 'movement_acceleration': 0.004180016009904057, 'movement_sprint_speed': 0.002145852784618517, 'power_strength': 0.0015979993801703432, 'power_stamina': 0.004146566393846889, 'power_jumping': 0.0017850974944014838, 'mentality_aggression': 0.0015829623172298746, 'mentality_positioning': 0.03821343654546548, 'mentality_vision': 0.022131172954283483},
    'ST': {'age': 0.001480089759674463, 'height_cm': 0.002033681502840874, 'weight_kg': 0.0015090038788964108, 'pace': 0.0030047870101957783, 'shooting': 0.8953357851471978, 'passing': 0.0027846423415423577, 'dribbling': 0.02273347905533413, 'defending': 0.0018647951698822893, 'physic': 0.008651396586056334, 'movement_acceleration': 0.0021526489432682466, 'movement_sprint_speed': 0.004068965657832994, 'power_strength': 0.006020868973367043, 'power_stamina': 0.0022497925601450905, 'power_jumping': 0.001885934289952346, 'mentality_aggression': 0.0022324186569419257, 'mentality_positioning': 0.04045877026647812, 'mentality_vision': 0.0015329402003937775},
    'LW': {'age': 0.001429434561536702, 'height_cm': 0.0015717030091343617, 'weight_kg': 0.0010678234576034307, 'pace': 0.0036834539176508214, 'shooting': 0.02615999580090714, 'passing': 0.081797958406456, 'dribbling': 0.7817264391059494, 'defending': 0.0017105279955704654, 'physic': 0.0021910902315379894, 'movement_acceleration': 0.003079835406873932, 'movement_sprint_speed': 0.00408845150962887, 'power_strength': 0.001879891527987754, 'power_stamina': 0.0042654949838385504, 'power_jumping': 0.0018469835111140586, 'mentality_aggression': 0.0019446346886621332, 'mentality_positioning': 0.06822096135171946, 'mentality_vision': 0.013335320533829003},
    'GK': {'age': 0.3227253425214956, 'height_cm': 0.04654487843655263, 'weight_kg': 0.047287147090610236, 'pace': 0.0, 'shooting': 0.0, 'passing': 0.0, 'dribbling': 0.0, 'defending': 0.0, 'physic': 0.0, 'movement_acceleration': 0.05581657549884249, 'movement_sprint_speed': 0.057945884044696284, 'power_strength': 0.06426243243091834, 'power_stamina': 0.049216793946199766, 'power_jumping': 0.1400953932397031, 'mentality_aggression': 0.04099067183797507, 'mentality_positioning': 0.060828550801029536, 'mentality_vision': 0.11428633015197684},
    'CAM': {'age': 0.0012461079030888502, 'height_cm': 0.0010587548435042737, 'weight_kg': 0.000942992487971949, 'pace': 0.0011349096235571449, 'shooting': 0.028441695755835588, 'passing': 0.5563217623060895, 'dribbling': 0.32083520853542274, 'defending': 0.0013751662738183182, 'physic': 0.0013603552160337468, 'movement_acceleration': 0.0012042238609413995, 'movement_sprint_speed': 0.0013316922370359388, 'power_strength': 0.0013245783860967655, 'power_stamina': 0.002024378963233883, 'power_jumping': 0.0011866906679119612, 'mentality_aggression': 0.0013854864022025384, 'mentality_positioning': 0.04176110329176948, 'mentality_vision': 0.03706489324548595},
    'CB': {'age': 0.0007864986834952639, 'height_cm': 0.0006439213683976001, 'weight_kg': 0.0007770378191749581, 'pace': 0.0006820631279053593, 'shooting': 0.0011002036206306924, 'passing': 0.005321962193649986, 'dribbling': 0.003794876366739995, 'defending': 0.949783184031047, 'physic': 0.02032292317339651, 'movement_acceleration': 0.0007635899588903819, 'movement_sprint_speed': 0.0010541843748197019, 'power_strength': 0.0029003123529927947, 'power_stamina': 0.0009143109531054201, 'power_jumping': 0.0014690547826413326, 'mentality_aggression': 0.007767998017431713, 'mentality_positioning': 0.0008879496317845092, 'mentality_vision': 0.0010299295438968058},
    'CM': {'age': 0.0016238600616497285, 'height_cm': 0.0014964714341950528, 'weight_kg': 0.001288063730034755, 'pace': 0.0009536283496906893, 'shooting': 0.003195583924035356, 'passing': 0.8557830875213243, 'dribbling': 0.038981067281535046, 'defending': 0.04144561340073616, 'physic': 0.005392551254462307, 'movement_acceleration': 0.0012754908174838378, 'movement_sprint_speed': 0.00114436286449503, 'power_strength': 0.0016407669804755084, 'power_stamina': 0.014024915074848411, 'power_jumping': 0.0016219247999275893, 'mentality_aggression': 0.0023123598641187565, 'mentality_positioning': 0.007978662219782691, 'mentality_vision': 0.019841590421204917},
    'CDM': {'age': 0.001793723491758059, 'height_cm': 0.0012838312047764346, 'weight_kg': 0.0013147677020942563, 'pace': 0.0010667706713552224, 'shooting': 0.0018014690485573849, 'passing': 0.0507869314449678, 'dribbling': 0.019899350459395816, 'defending': 0.8840324152137503, 'physic': 0.007888606330855747, 'movement_acceleration': 0.001437692894715452, 'movement_sprint_speed': 0.0012379489779969991, 'power_strength': 0.0018537761483646972, 'power_stamina': 0.007182082184422169, 'power_jumping': 0.0018559815289375759, 'mentality_aggression': 0.004792603296083949, 'mentality_positioning': 0.002036972520911884, 'mentality_vision': 0.009735076881056312},
    'CF': {'age': 0.0017515487754174632, 'height_cm': 0.001354274568910825, 'weight_kg': 0.0015746500838194864, 'pace': 0.003208241188567074, 'shooting': 0.23694601908366364, 'passing': 0.08730929205710186, 'dribbling': 0.3660715172188573, 'defending': 0.0031827043440139607, 'physic': 0.001370754019007916, 'movement_acceleration': 0.0024251907815265577, 'movement_sprint_speed': 0.0014795037625406238, 'power_strength': 0.0013171459831377269, 'power_stamina': 0.0020062287429595486, 'power_jumping': 0.0012469256616223947, 'mentality_aggression': 0.002012619688515905, 'mentality_positioning': 0.1292471518682359, 'mentality_vision': 0.15749623217210185},
    'LB': {'age': 0.0017560648404962523, 'height_cm': 0.0013909575868805433, 'weight_kg': 0.0013384265692497448, 'pace': 0.006868884654116317, 'shooting': 0.001953145707335308, 'passing': 0.05478626004641065, 'dribbling': 0.0587924031993675, 'defending': 0.8286152218421222, 'physic': 0.002421656794627066, 'movement_acceleration': 0.006228036983881384, 'movement_sprint_speed': 0.007340373891411248, 'power_strength': 0.0013405749744487573, 'power_stamina': 0.01895476868874335, 'power_jumping': 0.0019358157322114924, 'mentality_aggression': 0.0018942668581386566, 'mentality_positioning': 0.002598264843718461, 'mentality_vision': 0.0017848767868410135},
    'RB': {'age': 0.001721595212979275, 'height_cm': 0.0015078265537509198, 'weight_kg': 0.0015095330396541536, 'pace': 0.011376408862367734, 'shooting': 0.0023710316128096433, 'passing': 0.05117279574210121, 'dribbling': 0.08361264260339825, 'defending': 0.7981765086014542, 'physic': 0.0023105278047091623, 'movement_acceleration': 0.00536932436668452, 'movement_sprint_speed': 0.011756812492353889, 'power_strength': 0.0013582463495724949, 'power_stamina': 0.018732121754586866, 'power_jumping': 0.001733027925536264, 'mentality_aggression': 0.002214102446006567, 'mentality_positioning': 0.0028114569085677683, 'mentality_vision': 0.002266037723467282},
    'RM': {'age': 0.001544684188899295, 'height_cm': 0.0015588851645652855, 'weight_kg': 0.0013534621650804146, 'pace': 0.00580161527650414, 'shooting': 0.00842600770057202, 'passing': 0.14003397108513152, 'dribbling': 0.7201942386319036, 'defending': 0.001819517961566499, 'physic': 0.005075907742360983, 'movement_acceleration': 0.004558863187918549, 'movement_sprint_speed': 0.006898961064058152, 'power_strength': 0.001945012589062737, 'power_stamina': 0.012053742190509135, 'power_jumping': 0.0015702362737382227, 'mentality_aggression': 0.0018034136325828236, 'mentality_positioning': 0.07849633720591927, 'mentality_vision': 0.006865143939627385},
    'LM': {'age': 0.0019205998831481703, 'height_cm': 0.0015234474494346165, 'weight_kg': 0.0016463387802452727, 'pace': 0.005974062701152952, 'shooting': 0.008422433652624696, 'passing': 0.1431164425291795, 'dribbling': 0.7657817047668402, 'defending': 0.0018425304545920977, 'physic': 0.004273346338153524, 'movement_acceleration': 0.004626491460400516, 'movement_sprint_speed': 0.006704748800357114, 'power_strength': 0.0019142043215478813, 'power_stamina': 0.009672500038049385, 'power_jumping': 0.0018289898444025768, 'mentality_aggression': 0.001913690897269551, 'mentality_positioning': 0.03409574500922334, 'mentality_vision': 0.00474272307337872},
    'LWB': {'age': 0.005151803127097989, 'height_cm': 0.003089405572091488, 'weight_kg': 0.003284014456305069, 'pace': 0.002851150280691599, 'shooting': 0.004219881612542735, 'passing': 0.1503020151329288, 'dribbling': 0.2911697533705111, 'defending': 0.48129153541430203, 'physic': 0.00723373722082322, 'movement_acceleration': 0.0054372178472867514, 'movement_sprint_speed': 0.0037763819575288354, 'power_strength': 0.005530874624888081, 'power_stamina': 0.014311431184818708, 'power_jumping': 0.003123800365395881, 'mentality_aggression': 0.005933933060108838, 'mentality_positioning': 0.005961497819424868, 'mentality_vision': 0.007331566953253983},
    'RWB': {'age': 0.003585997258035418, 'height_cm': 0.0024595523147991094, 'weight_kg': 0.0043799979755209, 'pace': 0.0030498511982824305, 'shooting': 0.0027821293031970273, 'passing': 0.18364305859289534, 'dribbling': 0.06868373399324741, 'defending': 0.6503182131937173, 'physic': 0.0073594829359297734, 'movement_acceleration': 0.003038101092545173, 'movement_sprint_speed': 0.005528826332395367, 'power_strength': 0.003851625468141906, 'power_stamina': 0.03235196197278574, 'power_jumping': 0.003662063612941007, 'mentality_aggression': 0.0037406670357454275, 'mentality_positioning': 0.011587569505126814, 'mentality_vision': 0.00997716821469382}
}

# =========================
# تحديد هل CV رياضي
# =========================
def is_sports_cv(text):
    sports_keywords = [
        'football','soccer','player','striker','midfielder',
        'defender','goalkeeper','club','league','match','coach'
    ]
    text_lower = text.lower()
    return any(word in text_lower for word in sports_keywords)

# =========================
# استخراج الإنجازات
# =========================
def count_achievements(cv_text):
    keywords = [
        'title','trophy','award','awards','championship','cup',
        'winner','best midfielder','captain'
    ]
    total = 0
    for line in cv_text.split('\n'):
        line_lower = line.lower()
        if any(kw in line_lower for kw in keywords):
            total += 1
    return total

# =========================
# استخراج المعلومات البدنية
# =========================
def extract_physical_info(text):
    result = {'age': None, 'height_cm': None, 'weight_kg': None}

    age_match = re.search(r'(\d{1,2})\s*years?\s*old', text, re.IGNORECASE)
    if age_match:
        result['age'] = int(age_match.group(1))

    height_cm_match = re.search(r'(\d{3})\s*cm', text, re.IGNORECASE)
    if height_cm_match:
        result['height_cm'] = int(height_cm_match.group(1))

    height_ft_match = re.search(r"(\d)['\"'](\d{1,2})", text)
    if height_ft_match:
        feet = int(height_ft_match.group(1))
        inches = int(height_ft_match.group(2))
        result['height_cm'] = round(feet * 30.48 + inches * 2.54)

    weight_kg_match = re.search(r'(\d{2,3})\s*kg', text, re.IGNORECASE)
    if weight_kg_match:
        result['weight_kg'] = int(weight_kg_match.group(1))

    weight_st_match = re.search(r'(\d+)\s*st\s*(\d+)\s*lbs', text, re.IGNORECASE)
    if weight_st_match:
        stone = int(weight_st_match.group(1))
        lbs = int(weight_st_match.group(2))
        total_lbs = stone * 14 + lbs
        result['weight_kg'] = round(total_lbs * 0.453592)

    return result

# =========================
# استخراج المهارات
# =========================
def extract_skills(text):
    if not is_sports_cv(text):
        return {skill: 0 for skill in skill_keywords}

    text_lower = text.lower()
    skills = {}

    for skill, keywords in skill_keywords.items():
        found = 0
        for word in keywords:
            if re.search(r'\b' + re.escape(word) + r'\b', text_lower):
                found = 1
                break
        skills[skill] = found

    return skills

# =========================
# استخراج المركز
# =========================
def extract_position(text):
    if not is_sports_cv(text):
        return "Not a Player"

    text_lower = text.lower()

    positions = {
        'ST':  ['striker','forward','centre forward','center forward'],
        'RW':  ['right wing'],
        'LW':  ['left wing'],
        'CM':  ['midfielder','central midfielder'],
        'CAM': ['attacking midfielder','playmaker'],
        'CDM': ['defensive midfielder'],
        'CB':  ['center back','central defender'],
        'RB':  ['right back'],
        'LB':  ['left back'],
        'GK':  ['goalkeeper','keeper']
    }

    for pos, keywords in positions.items():
        for word in keywords:
            if word in text_lower:
                return pos

    return "Unknown"

# =========================
# تحويل CV إلى DataFrame
# =========================
def process_cv(cv_text):
    achievements = count_achievements(cv_text)
    physical     = extract_physical_info(cv_text)
    skills       = extract_skills(cv_text)
    position     = extract_position(cv_text)

    data = {**physical, **skills}
    data['main_position'] = position
    data['Achievements']  = achievements

    return pd.DataFrame([data])

# =========================
# تحديد المهارات المستوفاة
# =========================
def get_met_skills(player, requirements):
    met_skills = []
    player_row = player.iloc[0]

    for key, req_value in requirements.items():
        if key == 'age_min':
            if player_row.get('age') is not None and player_row['age'] >= req_value:
                if 'age_max' not in requirements or (requirements.get('age_max') is not None and player_row['age'] <= requirements['age_max']):
                    met_skills.append('age')
        elif key == 'age_max':
            if 'age_min' not in requirements and player_row.get('age') is not None and player_row['age'] <= req_value:
                met_skills.append('age')
        elif key == 'height_cm' and player_row.get('height_cm') is not None and player_row['height_cm'] >= req_value:
            met_skills.append('height_cm')
        elif key == 'weight_kg' and player_row.get('weight_kg') is not None and player_row['weight_kg'] >= req_value:
            met_skills.append('weight_kg')
        elif key == 'achievements' and player_row.get('Achievements') is not None and player_row['Achievements'] >= req_value:
            met_skills.append('achievements')
        elif key in player_row and req_value == 1:
            if player_row[key] == 1:
                met_skills.append(key)

    return list(set(met_skills))

# =========================
# حساب التقييم
# =========================
def evaluate_player(player, requirements):
    required_pos = requirements.get('main_position')

    if required_pos is None or required_pos == "Unknown":
        return 0.0

    weights = position_weights.get(required_pos)
    if weights is None:
        return 0.0

    met_skills = get_met_skills(player, requirements)

    score = 0.0
    for skill_name in met_skills:
        if skill_name in weights:
            score += weights[skill_name]

    return round(score, 4)

# =========================
# قراءة الملف
# =========================
def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    text = ""
    if filename.lower().endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    elif filename.lower().endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        text = file_bytes.decode("utf-8", errors="ignore")
    return text

# =========================
# الدالة الرئيسية
# =========================
def analyze_cv_against_club(file_bytes: bytes, filename: str, club_requirements: dict) -> dict:
    # قراءة الـ CV
    cv_text = extract_text_from_file(file_bytes, filename)

    # معالجة الـ CV
    player_df = process_cv(cv_text)

    # حساب التقييم
    score = evaluate_player(player_df, club_requirements)

    # تحويل الـ score لنسبة مئوية (الـ score الأقصى تقريباً 1.0)
    score_percent = round(min(score * 100, 100), 1)

    # المهارات المستوفاة
    met_skills = get_met_skills(player_df, club_requirements)

    # حالة التطابق
    if score_percent >= 80:
        status = "Excellent Match"
    elif score_percent >= 60:
        status = "Good Match"
    elif score_percent >= 40:
        status = "Partial Match"
    else:
        status = "Low Match"

    player_row = player_df.iloc[0]

    return {
        "score":           float(score_percent),
    "raw_score":       float(score),
    "status":          status,
    "is_sports_cv":    bool(is_sports_cv(cv_text)),
    "player_position": str(player_row.get('main_position', 'Unknown')),
    "met_skills":      [str(s) for s in met_skills],
    "player_info": {
        "age":          int(player_row['age']) if player_row.get('age') is not None else None,
        "height_cm":    int(player_row['height_cm']) if player_row.get('height_cm') is not None else None,
        "weight_kg":    int(player_row['weight_kg']) if player_row.get('weight_kg') is not None else None,
        "achievements": int(player_row.get('Achievements', 0)),
        }
    }



def extract_club_requirements_from_text(text: str) -> dict:
    text_lower = text.lower()
    req = {}

    skills = ['passing','shooting','dribbling','defending','pace',
              'movement_acceleration','movement_sprint_speed','physic',
              'power_strength','power_stamina','power_jumping',
              'mentality_aggression','mentality_positioning','mentality_vision',
              'teamwork','tactics']

    for skill in skills:
        req[skill] = 1 if skill in text_lower else 0

    age_match = re.search(r'age.*?(\d+)[\s\-]*(\d+)?', text_lower)
    if age_match:
        if age_match.group(2):
            req['age_min'] = int(age_match.group(1))
            req['age_max'] = int(age_match.group(2))
        else:
            req['age_min'] = int(age_match.group(1))
            req['age_max'] = None
    else:
        req['age_min'] = req['age_max'] = None

    height_match = re.search(r'height.*?(\d{2,3})\s*cm', text_lower)
    req['height_cm'] = int(height_match.group(1)) if height_match else 0

    weight_match = re.search(r'weight.*?(\d{2,3})', text_lower)
    req['weight_kg'] = int(weight_match.group(1)) if weight_match else 0

    exp_match = re.search(r'(\d+)\s*years', text_lower)
    req['experience_years'] = int(exp_match.group(1)) if exp_match else 0

    trophy_match = re.search(r'(\d+)\s*(league|cup|title|championship|award|trophy)', text_lower)
    req['achievements'] = int(trophy_match.group(1)) if trophy_match else 0

    position_priority = [
        ('central attacking midfielder', 'CAM'),
        ('attacking midfielder', 'CAM'),
        ('playmaker', 'CAM'),
        ('defensive midfielder', 'CDM'),
        ('holding midfielder', 'CDM'),
        ('central midfielder', 'CM'),
        ('midfielder', 'CM'),
        ('striker', 'ST'),
        ('center forward', 'ST'),
        ('forward', 'ST'),
        ('right winger', 'RW'),
        ('right wing', 'RW'),
        ('left winger', 'LW'),
        ('left wing', 'LW'),
        ('center back', 'CB'),
        ('central defender', 'CB'),
        ('right back', 'RB'),
        ('left back', 'LB'),
        ('goalkeeper', 'GK'),
        ('keeper', 'GK'),
    ]

    req['main_position'] = 'Unknown'
    for key, abbrev in position_priority:
        if key in text_lower:
            req['main_position'] = abbrev
            break

    return req