-- Add idol members for groups that currently have no individual members seeded
-- Also add new notable groups and solo artists

-- ============================================================
-- New Groups
-- ============================================================
INSERT INTO public.groups (name, name_ko, slug, agency, debut_date, member_count, popularity_score, description) VALUES
('PLAVE', '플레이브', 'plave', 'VLAST', '2023-03-12', 5, 4700, 'Virtual 5-member boy group known for powerful vocals and virtual performances.'),
('KATSEYE', 'KATSEYE', 'katseye', 'HYBE x Geffen', '2024-06-28', 6, 4100, '6-member global girl group formed through The Debut: Dream Academy.'),
('tripleS', '트리플에스', 'triples', 'MODHAUS', '2022-05-24', 24, 3800, 'Large-scale rotating girl group with multiple sub-units.'),
('QWER', 'QWER', 'qwer', 'VLENDING', '2023-05-15', 4, 3500, '4-member girl band known for band-style K-pop performances.'),
('Weki Meki', '위키미키', 'weki-meki', 'Fantagio', '2017-08-08', 8, 2800, '8-member girl group known for quirky, fun concepts.'),
('EVNNE', 'EVNNE', 'evnne', 'Jellyfish Entertainment', '2023-09-07', 7, 3200, '7-member boy group from Boys Planet.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- NCT 127 members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Taeyong', '태용', 'taeyong', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Leader, Main Rapper, Main Dancer', '1995-07-01', 'Korean', 8500),
('Mark', '마크', 'mark-nct', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Main Rapper, Vocal', '1999-08-02', 'Korean-Canadian', 8200),
('Jaehyun', '재현', 'jaehyun', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Lead Vocal, Visual', '1997-02-14', 'Korean', 8000),
('Doyoung', '도영', 'doyoung', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Main Vocal', '1996-02-01', 'Korean', 7800),
('Haechan', '해찬', 'haechan', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Main Vocal', '2000-06-06', 'Korean', 7500),
('Yuta', '유타', 'yuta', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Lead Dancer', '1995-10-26', 'Japanese', 7200),
('Johnny', '쟈니', 'johnny', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Sub Vocal', '1995-02-09', 'Korean-American', 7000),
('Jungwoo', '정우', 'jungwoo', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Lead Vocal', '1998-02-19', 'Korean', 6800),
('Taeil', '태일', 'taeil-nct', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Main Vocal', '1994-06-14', 'Korean', 6500),
('Doyoung', '도영', 'winwin', (SELECT id FROM public.groups WHERE slug='nct-127'), 'Lead Dancer', '1997-10-28', 'Chinese', 6300)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- NCT DREAM members (excluding Mark/Haechan who are in 127)
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Jeno', '제노', 'jeno', (SELECT id FROM public.groups WHERE slug='nct-dream'), 'Lead Dancer, Lead Rapper', '2000-04-23', 'Korean', 7500),
('Jaemin', '재민', 'jaemin', (SELECT id FROM public.groups WHERE slug='nct-dream'), 'Lead Dancer, Lead Rapper', '2000-08-13', 'Korean', 7400),
('Renjun', '런쥔', 'renjun', (SELECT id FROM public.groups WHERE slug='nct-dream'), 'Main Vocal', '2000-03-23', 'Chinese', 7000),
('Chenle', '천러', 'chenle', (SELECT id FROM public.groups WHERE slug='nct-dream'), 'Main Vocal', '2001-11-22', 'Chinese', 6800),
('Jisung', '지성', 'jisung-nct', (SELECT id FROM public.groups WHERE slug='nct-dream'), 'Main Dancer, Maknae', '2002-02-05', 'Korean', 6500)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ATEEZ members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Hongjoong', '홍중', 'hongjoong', (SELECT id FROM public.groups WHERE slug='ateez'), 'Leader, Main Rapper, Producer', '1998-11-07', 'Korean', 7500),
('Seonghwa', '성화', 'seonghwa', (SELECT id FROM public.groups WHERE slug='ateez'), 'Lead Vocal, Visual', '1998-04-03', 'Korean', 7300),
('San', '산', 'san', (SELECT id FROM public.groups WHERE slug='ateez'), 'Main Dancer, Vocal', '1999-07-10', 'Korean', 7200),
('Wooyoung', '우영', 'wooyoung', (SELECT id FROM public.groups WHERE slug='ateez'), 'Main Dancer, Lead Vocal', '1999-11-26', 'Korean', 7000),
('Yunho', '윤호', 'yunho-ateez', (SELECT id FROM public.groups WHERE slug='ateez'), 'Main Dancer', '1999-03-23', 'Korean', 6800),
('Yeosang', '여상', 'yeosang', (SELECT id FROM public.groups WHERE slug='ateez'), 'Dance, Vocal', '1999-06-15', 'Korean', 6700),
('Mingi', '민기', 'mingi', (SELECT id FROM public.groups WHERE slug='ateez'), 'Main Rapper', '1999-08-09', 'Korean', 6600),
('Jongho', '종호', 'jongho', (SELECT id FROM public.groups WHERE slug='ateez'), 'Main Vocal, Maknae', '2000-10-12', 'Korean', 6500)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- EXO members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Baekhyun', '백현', 'baekhyun', (SELECT id FROM public.groups WHERE slug='exo'), 'Main Vocal', '1992-05-06', 'Korean', 8000),
('Kai', '카이', 'kai', (SELECT id FROM public.groups WHERE slug='exo'), 'Main Dancer, Lead Rapper', '1994-01-14', 'Korean', 7800),
('Chanyeol', '찬열', 'chanyeol', (SELECT id FROM public.groups WHERE slug='exo'), 'Main Rapper, Vocal', '1992-11-27', 'Korean', 7500),
('D.O.', '디오', 'do-exo', (SELECT id FROM public.groups WHERE slug='exo'), 'Main Vocal', '1993-01-12', 'Korean', 7500),
('Sehun', '세훈', 'sehun', (SELECT id FROM public.groups WHERE slug='exo'), 'Lead Dancer, Lead Rapper', '1994-04-12', 'Korean', 7200),
('Suho', '수호', 'suho', (SELECT id FROM public.groups WHERE slug='exo'), 'Leader, Lead Vocal', '1991-05-22', 'Korean', 7000),
('Xiumin', '시우민', 'xiumin', (SELECT id FROM public.groups WHERE slug='exo'), 'Lead Vocal, Lead Dancer', '1990-03-26', 'Korean', 6800),
('Chen', '첸', 'chen', (SELECT id FROM public.groups WHERE slug='exo'), 'Main Vocal', '1992-09-21', 'Korean', 6800),
('Lay', '레이', 'lay', (SELECT id FROM public.groups WHERE slug='exo'), 'Main Dancer, Vocal', '1991-10-07', 'Chinese', 6500)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Red Velvet members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Irene', '아이린', 'irene', (SELECT id FROM public.groups WHERE slug='red-velvet'), 'Leader, Visual, Lead Dancer', '1991-03-29', 'Korean', 7500),
('Seulgi', '슬기', 'seulgi', (SELECT id FROM public.groups WHERE slug='red-velvet'), 'Main Dancer, Lead Vocal', '1994-02-10', 'Korean', 7300),
('Wendy', '웬디', 'wendy', (SELECT id FROM public.groups WHERE slug='red-velvet'), 'Main Vocal', '1994-02-21', 'Korean', 7000),
('Joy', '조이', 'joy', (SELECT id FROM public.groups WHERE slug='red-velvet'), 'Lead Rapper, Vocal', '1996-09-03', 'Korean', 6800),
('Yeri', '예리', 'yeri', (SELECT id FROM public.groups WHERE slug='red-velvet'), 'Vocal, Maknae', '1999-03-05', 'Korean', 6500)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ITZY members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Yeji', '예지', 'yeji', (SELECT id FROM public.groups WHERE slug='itzy'), 'Leader, Main Dancer, Lead Vocal', '2000-05-26', 'Korean', 7000),
('Lia', '리아', 'lia', (SELECT id FROM public.groups WHERE slug='itzy'), 'Main Vocal', '2000-07-21', 'Korean', 6500),
('Ryujin', '류진', 'ryujin', (SELECT id FROM public.groups WHERE slug='itzy'), 'Main Rapper, Lead Dancer', '2001-04-17', 'Korean', 6800),
('Chaeryeong', '채령', 'chaeryeong', (SELECT id FROM public.groups WHERE slug='itzy'), 'Main Dancer', '2001-06-05', 'Korean', 6200),
('Yuna', '유나', 'yuna-itzy', (SELECT id FROM public.groups WHERE slug='itzy'), 'Lead Dancer, Visual, Maknae', '2003-12-09', 'Korean', 6500)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- NMIXX members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Haewon', '해원', 'haewon', (SELECT id FROM public.groups WHERE slug='nmixx'), 'Leader, Main Vocal', '2003-05-18', 'Korean', 6500),
('Sullyoon', '설윤', 'sullyoon', (SELECT id FROM public.groups WHERE slug='nmixx'), 'Visual, Vocal', '2004-01-26', 'Korean', 6800),
('Jinni', '진니', 'jinni', (SELECT id FROM public.groups WHERE slug='nmixx'), 'Main Rapper, Lead Dancer', '2004-04-16', 'Korean', 5800),
('Bae', '배', 'bae-nmixx', (SELECT id FROM public.groups WHERE slug='nmixx'), 'Lead Vocal', '2003-10-30', 'Korean', 6000),
('Jiwoo', '지우', 'jiwoo-nmixx', (SELECT id FROM public.groups WHERE slug='nmixx'), 'Main Dancer', '2005-02-13', 'Korean', 5800),
('Kyujin', '규진', 'kyujin', (SELECT id FROM public.groups WHERE slug='nmixx'), 'Main Dancer, Lead Rapper, Maknae', '2006-04-26', 'Korean', 6200)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TREASURE members (top members)
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Hyunsuk', '현석', 'hyunsuk', (SELECT id FROM public.groups WHERE slug='treasure'), 'Leader, Main Rapper, Producer', '1999-04-21', 'Korean', 6200),
('Jihoon', '지훈', 'jihoon-treasure', (SELECT id FROM public.groups WHERE slug='treasure'), 'Lead Vocal, Visual', '2000-03-14', 'Korean', 6000),
('Yoshi', '요시', 'yoshi', (SELECT id FROM public.groups WHERE slug='treasure'), 'Rapper', '2000-05-15', 'Japanese', 5800),
('Junkyu', '준규', 'junkyu', (SELECT id FROM public.groups WHERE slug='treasure'), 'Main Vocal', '2000-09-09', 'Korean', 6000),
('Haruto', '하루토', 'haruto', (SELECT id FROM public.groups WHERE slug='treasure'), 'Main Rapper', '2004-04-05', 'Japanese', 5800),
('Doyoung', '도영', 'doyoung-treasure', (SELECT id FROM public.groups WHERE slug='treasure'), 'Lead Vocal', '2003-12-14', 'Korean', 5500),
('Jeongwoo', '정우', 'jeongwoo-treasure', (SELECT id FROM public.groups WHERE slug='treasure'), 'Main Vocal', '2004-09-28', 'Korean', 5500),
('Asahi', '아사히', 'asahi', (SELECT id FROM public.groups WHERE slug='treasure'), 'Vocal, Producer', '2001-08-20', 'Japanese', 5300),
('Jaehyuk', '재혁', 'jaehyuk', (SELECT id FROM public.groups WHERE slug='treasure'), 'Rapper, Vocal', '2001-07-23', 'Korean', 5200),
('Junghwan', '정환', 'junghwan', (SELECT id FROM public.groups WHERE slug='treasure'), 'Main Vocal, Maknae', '2005-02-18', 'Korean', 5000)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SHINee members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Taemin', '태민', 'taemin', (SELECT id FROM public.groups WHERE slug='shinee'), 'Main Dancer, Lead Vocal', '1993-07-18', 'Korean', 7000),
('Minho', '민호', 'minho', (SELECT id FROM public.groups WHERE slug='shinee'), 'Main Rapper, Visual', '1991-12-09', 'Korean', 6200),
('Key', '키', 'key-shinee', (SELECT id FROM public.groups WHERE slug='shinee'), 'Lead Rapper, Lead Dancer', '1991-09-23', 'Korean', 6000),
('Onew', '온유', 'onew', (SELECT id FROM public.groups WHERE slug='shinee'), 'Leader, Main Vocal', '1989-12-14', 'Korean', 5800)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MAMAMOO members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Hwasa', '화사', 'hwasa', (SELECT id FROM public.groups WHERE slug='mamamoo'), 'Main Vocal, Lead Dancer', '1995-07-23', 'Korean', 6500),
('Solar', '솔라', 'solar', (SELECT id FROM public.groups WHERE slug='mamamoo'), 'Leader, Main Vocal', '1991-02-21', 'Korean', 6200),
('Moonbyul', '문별', 'moonbyul', (SELECT id FROM public.groups WHERE slug='mamamoo'), 'Main Rapper, Lead Dancer', '1992-12-22', 'Korean', 6000),
('Wheein', '휘인', 'wheein', (SELECT id FROM public.groups WHERE slug='mamamoo'), 'Main Vocal, Lead Dancer', '1995-04-17', 'Korean', 5800)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- BOYNEXTDOOR members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Sungho', '성호', 'sungho', (SELECT id FROM public.groups WHERE slug='boynextdoor'), 'Leader, Main Vocal', '2003-05-05', 'Korean', 5000),
('Riwoo', '리우', 'riwoo', (SELECT id FROM public.groups WHERE slug='boynextdoor'), 'Main Dancer, Vocal', '2003-05-19', 'Korean', 4800),
('Jaehyun', '재현', 'jaehyun-bnd', (SELECT id FROM public.groups WHERE slug='boynextdoor'), 'Lead Rapper, Vocal', '2004-04-13', 'Korean', 4600),
('Taesan', '태산', 'taesan', (SELECT id FROM public.groups WHERE slug='boynextdoor'), 'Main Rapper, Vocal', '2004-07-02', 'Korean', 5200),
('Leehan', '이한', 'leehan', (SELECT id FROM public.groups WHERE slug='boynextdoor'), 'Visual, Vocal', '2005-04-04', 'Korean', 5000),
('Woonhak', '운학', 'woonhak', (SELECT id FROM public.groups WHERE slug='boynextdoor'), 'Lead Dancer, Vocal, Maknae', '2006-11-29', 'Korean', 4800)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- BABYMONSTER members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Ruka', '루카', 'ruka', (SELECT id FROM public.groups WHERE slug='babymonster'), 'Main Rapper, Lead Dancer', '2002-03-20', 'Japanese', 4800),
('Pharita', '파리타', 'pharita', (SELECT id FROM public.groups WHERE slug='babymonster'), 'Main Dancer, Vocal', '2005-08-28', 'Thai', 4600),
('Asa', '아사', 'asa', (SELECT id FROM public.groups WHERE slug='babymonster'), 'Lead Rapper', '2006-04-18', 'Japanese', 4500),
('Ahyeon', '아현', 'ahyeon', (SELECT id FROM public.groups WHERE slug='babymonster'), 'Main Vocal, Center', '2007-04-11', 'Korean', 5000),
('Rami', '라미', 'rami', (SELECT id FROM public.groups WHERE slug='babymonster'), 'Vocal', '2007-12-03', 'Korean', 4200),
('Chiquita', '치키타', 'chiquita', (SELECT id FROM public.groups WHERE slug='babymonster'), 'Lead Dancer, Vocal', '2008-08-05', 'Thai', 4500),
('Rora', '로라', 'rora', (SELECT id FROM public.groups WHERE slug='babymonster'), 'Visual, Vocal, Maknae', '2008-08-29', 'Korean', 4800)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- RIIZE members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Shotaro', '쇼타로', 'shotaro', (SELECT id FROM public.groups WHERE slug='riize'), 'Main Dancer, Leader', '2000-11-25', 'Japanese', 4800),
('Eunseok', '은석', 'eunseok', (SELECT id FROM public.groups WHERE slug='riize'), 'Visual, Vocal', '2002-07-26', 'Korean', 4500),
('Sungchan', '성찬', 'sungchan', (SELECT id FROM public.groups WHERE slug='riize'), 'Rapper, Vocal', '2001-09-13', 'Korean', 4500),
('Wonbin', '원빈', 'wonbin', (SELECT id FROM public.groups WHERE slug='riize'), 'Rapper, Visual', '2003-09-17', 'Korean', 5000),
('Sohee', '소희', 'sohee-riize', (SELECT id FROM public.groups WHERE slug='riize'), 'Vocal', '2003-11-14', 'Korean', 4300),
('Anton', '앤톤', 'anton', (SELECT id FROM public.groups WHERE slug='riize'), 'Vocal, Maknae', '2004-03-21', 'Korean-American', 4500)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- KISS OF LIFE members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Julie', '줄리', 'julie', (SELECT id FROM public.groups WHERE slug='kiss-of-life'), 'Main Vocal, Leader', '2002-08-08', 'Korean-American', 3500),
('Natty', '나띠', 'natty', (SELECT id FROM public.groups WHERE slug='kiss-of-life'), 'Main Dancer, Vocal', '2002-10-27', 'Thai', 3300),
('Belle', '벨', 'belle', (SELECT id FROM public.groups WHERE slug='kiss-of-life'), 'Main Vocal', '2004-01-22', 'Korean', 3200),
('Haneul', '하늘', 'haneul', (SELECT id FROM public.groups WHERE slug='kiss-of-life'), 'Vocal, Rapper, Maknae', '2005-07-04', 'Korean', 3000)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Dreamcatcher members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('JiU', '지유', 'jiu', (SELECT id FROM public.groups WHERE slug='dreamcatcher'), 'Leader, Main Vocal', '1994-05-17', 'Korean', 6500),
('SuA', '수아', 'sua', (SELECT id FROM public.groups WHERE slug='dreamcatcher'), 'Lead Dancer, Lead Vocal', '1994-08-10', 'Korean', 6200),
('Siyeon', '시연', 'siyeon', (SELECT id FROM public.groups WHERE slug='dreamcatcher'), 'Main Vocal', '1995-10-01', 'Korean', 6200),
('Handong', '한동', 'handong', (SELECT id FROM public.groups WHERE slug='dreamcatcher'), 'Sub Vocal', '1996-03-26', 'Chinese', 5800),
('Yoohyeon', '유현', 'yoohyeon', (SELECT id FROM public.groups WHERE slug='dreamcatcher'), 'Lead Vocal', '1997-01-07', 'Korean', 6000),
('Dami', '다미', 'dami', (SELECT id FROM public.groups WHERE slug='dreamcatcher'), 'Main Rapper, Lead Dancer', '1997-03-07', 'Korean', 5800),
('Gahyeon', '가현', 'gahyeon', (SELECT id FROM public.groups WHERE slug='dreamcatcher'), 'Sub Vocal, Maknae', '1999-02-03', 'Korean', 5700)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- GOT7 members
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('Jackson', '잭슨', 'jackson-got7', (SELECT id FROM public.groups WHERE slug='got7'), 'Lead Rapper, Lead Dancer', '1994-03-28', 'Hong Kong', 5000),
('Jinyoung', '진영', 'jinyoung-got7', (SELECT id FROM public.groups WHERE slug='got7'), 'Lead Vocal, Visual', '1994-09-22', 'Korean', 4500),
('BamBam', '뱀뱀', 'bambam', (SELECT id FROM public.groups WHERE slug='got7'), 'Lead Dancer, Sub Rapper', '1997-05-02', 'Thai', 4300),
('Yugyeom', '유겸', 'yugyeom', (SELECT id FROM public.groups WHERE slug='got7'), 'Main Dancer, Lead Vocal, Maknae', '1997-11-17', 'Korean', 4000),
('Jay B', '제이비', 'jay-b', (SELECT id FROM public.groups WHERE slug='got7'), 'Leader, Main Vocal, Lead Dancer', '1994-01-06', 'Korean', 4200),
('Youngjae', '영재', 'youngjae', (SELECT id FROM public.groups WHERE slug='got7'), 'Main Vocal', '1996-09-17', 'Korean', 3800),
('Mark', '마크', 'mark-got7', (SELECT id FROM public.groups WHERE slug='got7'), 'Lead Rapper', '1993-09-04', 'Korean-American', 4000)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Notable solo artists (no group)
-- ============================================================
INSERT INTO public.idols (name, name_ko, slug, group_id, position, birth_date, nationality, popularity_score) VALUES
('IU', '아이유', 'iu', NULL, 'Solo Singer-Songwriter, Actress', '1993-05-16', 'Korean', 13000),
('Sunmi', '선미', 'sunmi', NULL, 'Solo Singer, Former Wonder Girls', '1992-05-02', 'Korean', 5500),
('Chungha', '청하', 'chungha', NULL, 'Solo Singer, Former I.O.I', '1996-02-09', 'Korean', 5000),
('Taeyeon', '태연', 'taeyeon', NULL, 'Solo Singer, SNSD Main Vocal', '1989-03-09', 'Korean', 7000),
('HyunA', '현아', 'hyuna', NULL, 'Solo Singer, Former 4Minute', '1992-06-06', 'Korean', 5000)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Update new source entries for English K-pop news sites
-- ============================================================
INSERT INTO public.sources (name, url, rss_url, category) VALUES
('Soompi', 'https://www.soompi.com', 'https://www.soompi.com/feed', 'web'),
('allkpop', 'https://www.allkpop.com', 'https://feeds.feedburner.com/allkpop', 'web'),
('Koreaboo', 'https://www.koreaboo.com', 'https://www.koreaboo.com/feed/', 'web')
ON CONFLICT DO NOTHING;
