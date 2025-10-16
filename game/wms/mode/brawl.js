'use strict';
game.import('mode',function(lib,game,ui,get,ai,_status){
	return {
		name:'brawl',
		game:{
			syncMenu:true,
		},
		start:function(){
			ui.auto.hide();
			if(!lib.storage.scene){
				lib.storage.scene={};
			}
			if(!lib.storage.stage){
				lib.storage.stage={};
			}
			if(!_status.extensionmade){
				_status.extensionmade=[];
			}
			if(_status.extensionscene){
				game.save('scene',lib.storage.scene);
			}
			if(_status.extensionstage){
				game.save('stage',lib.storage.stage);
			}
			var dialog=ui.create.dialog('hidden');
			dialog.classList.add('fixed');
			dialog.classList.add('scroll1');
			dialog.classList.add('scroll2');
			dialog.classList.add('fullwidth');
			dialog.classList.add('fullheight');
			dialog.classList.add('noupdate');
			dialog.classList.add('character');
			dialog.contentContainer.style.overflow='visible';
			dialog.style.overflow='hidden';
			dialog.content.style.height='100%';
			dialog.contentContainer.style.transition='all 0s';
			if(!lib.storage.directStage) dialog.open();
			var packnode=ui.create.div('.packnode',dialog);
			lib.setScroll(packnode);
			var clickCapt=function(){
				var active=this.parentNode.querySelector('.active');
				if(this.link=='stage'){
					if(get.is.empty(lib.storage.scene)){
						alert('请创建至少1个场景');
						return;
					}
				}
				if(active){
					if(active==this) return;
					for(var i=0;i<active.nodes.length;i++){
						active.nodes[i].remove();
						if(active.nodes[i].showcaseinterval){
							clearInterval(active.nodes[i].showcaseinterval);
							delete active.nodes[i].showcaseinterval;
						}
					}
					active.classList.remove('active');
				}
				this.classList.add('active');
				for(var i=0;i<this.nodes.length;i++){
					dialog.content.appendChild(this.nodes[i]);
				}
				var showcase=this.nodes[this.nodes.length-1];
				showcase.style.height=(dialog.content.offsetHeight-showcase.offsetTop)+'px';
				if(typeof showcase.action=='function'){
					if(showcase.action(showcase._showcased?false:true)!==false){
						showcase._showcased=true;
					}
				}
				if(this._nostart) start.style.display='none';
				else start.style.display='';
				game.save('currentBrawl',this.link);
			}
			var createNode=function(name){
				var info=lib.brawl[name];
				var node=ui.create.div('.dialogbutton.menubutton.large',info.name,packnode,clickCapt);
				node.style.transition='all 0s';
				var caption=info.name;
				var modeinfo='';
				if(info.mode){
					modeinfo=get.translation(info.mode)+'模式';
				}
				if(info.submode){
					if(modeinfo){
						modeinfo+=' - ';
					}
					modeinfo+=info.submode;
				}
				var intro;
				if(Array.isArray(info.intro)){
					intro='<ul style="text-align:left;margin-top:0;width:450px">';
					if(modeinfo){
						intro+='<li>'+modeinfo;
					}
					for(var i=0;i<info.intro.length;i++){
						intro+='<li>'+info.intro[i];
					}
				}
				else{
					intro='';
					if(modeinfo){
						intro+='（'+modeinfo+'）';
					}
					intro+=info.intro;
				}
				var showcase=ui.create.div();
				showcase.style.margin='0px';
				showcase.style.padding='0px';
				showcase.style.width='100%';
				showcase.style.display='block'
				showcase.action=info.showcase;
				showcase.link=name;
				if(info.fullshow){
					node.nodes=[showcase];
					showcase.style.height='100%';
				}
				else{
					node.nodes=[
						ui.create.div('.caption',caption),
						ui.create.div('.text center',intro),
						showcase
					];
				}
				node.link=name;
				node._nostart=info.nostart;
				if(lib.storage.currentBrawl==name){
					clickCapt.call(node);
				}
				return node;
			}
			var clickStart=function(){
				var active=packnode.querySelector('.active');
				if(active){
					for(var i=0;i<active.nodes.length;i++){
						if(active.nodes[i].showcaseinterval){
							clearInterval(active.nodes[i].showcaseinterval);
							delete active.nodes[i].showcaseinterval;
						}
					}
					var info;
					if(active.link.indexOf('stage_')==0){
						var level;
						if(Array.isArray(arguments[0])){
							level={index:arguments[0][1]};
						}
						else{
							level=dialog.content.querySelector('.menubutton.large.active');
						}
						if(level){
							var stagesave=lib.storage.stage;
							var stage=stagesave[active.link.slice(6)];
							game.save('lastStage',level.index);
							lib.onover.push(function(bool){
								_status.createControl=ui.controls[0];
								if(bool&&level.index+1<stage.scenes.length){
									ui.create.control('下一关',function(){
										game.save('directStage',[stage.name,level.index+1],'brawl');
										localStorage.setItem(lib.configprefix+'directstart',true);
										game.reload();
									});
									if(level.index+1>stage.level){
										stage.level=level.index+1;
										game.save('stage',stagesave,'brawl');
									}
									if(stage.mode!='sequal'){
										game.save('lastStage',level.index+1,'brawl');
									}
								}
								else{
									ui.create.control('重新开始',function(){
										if(stage.mode=='sequal'&&bool&&level.index==stage.scenes.length-1){
											game.save('directStage',[stage.name,0],'brawl');
										}
										else{
											game.save('directStage',[stage.name,level.index],'brawl');
										}
										localStorage.setItem(lib.configprefix+'directstart',true);
										game.reload();
									});
									if(stage.mode=='sequal'&&level.index==stage.scenes.length-1){
										stage.level=0;
										game.save('stage',stagesave,'brawl');
									}
									if(stage.mode!='sequal'){
										game.save('lastStage',level.index,'brawl');
									}
								}
								delete _status.createControl;
							});
							var scene=stage.scenes[level.index];
							info={
								name:scene.name,
								intro:scene.intro,
							};
							for(var i in lib.brawl.scene.template){
								info[i]=get.copy(lib.brawl.scene.template[i]);
							}
							if(!scene.gameDraw){
								info.content.noGameDraw=true;
							}
							info.content.scene=scene;
						}
						else{
							return;
						}
					}
					else{
						info=lib.brawl[active.link];
					}
					lib.translate.restart='返回';
					dialog.delete();
					ui.brawlinfo=ui.create.system('乱斗',null,true);
					lib.setPopped(ui.brawlinfo,function(){
						var uiintro=ui.create.dialog('hidden');
						uiintro.add(info.name);
						var intro;
						if(Array.isArray(info.intro)){
							intro='<ul style="text-align:left;margin-top:0;width:450px">';
							for(var i=0;i<info.intro.length;i++){
								intro+='<li>'+info.intro[i];
							}
							intro+='</ul>'
						}
						else{
							intro=info.intro;
						}
						uiintro.add('<div class="text center">'+intro+'</div>');
						var ul=uiintro.querySelector('ul');
						if(ul){
							ul.style.width='180px';
						}
						uiintro.add(ui.create.div('.placeholder'));
						return uiintro;
					},250);
					ui.auto.show();
					_status.brawl=info.content;
					game.switchMode(info.mode);
					if(info.init){
						info.init();
					}
				}
			};
			var start=ui.create.div('.menubutton.round.highlight','斗',dialog.content,clickStart);
			start.style.position='absolute';
			start.style.left='auto';
			start.style.right='10px';
			start.style.top='auto';
			start.style.bottom='10px';
			start.style.width='80px';
			start.style.height='80px';
			start.style.lineHeight='80px';
			start.style.margin='0';
			start.style.padding='5px';
			start.style.fontSize='72px';
			start.style.zIndex=3;
			start.style.transition='all 0s';
			game.addScene=function(name,clear){
				var scene=lib.storage.scene[name];
				var brawl={
					name:name,
					intro:scene.intro,
				};
				for(var i in lib.brawl.scene.template){
					brawl[i]=get.copy(lib.brawl.scene.template[i]);
				}
				if(!scene.gameDraw){
					brawl.content.noGameDraw=true;
				}
				brawl.content.scene=scene;
				lib.brawl['scene_'+name]=brawl;
				var node=createNode('scene_'+name);
				if(clear){
					game.addSceneClear();
					clickCapt.call(node);
					_status.sceneChanged=true;
				}
			};
			game.addStage=function(name,clear){
				var stage=lib.storage.stage[name];
				var brawl={
					name:name,
					intro:stage.intro,
					content:{}
				};
				for(var i in lib.brawl.stage.template){
					brawl[i]=get.copy(lib.brawl.stage.template[i]);
				}
				brawl.content.stage=stage;
				lib.brawl['stage_'+name]=brawl;
				var node=createNode('stage_'+name);
				if(clear){
					game.addStageClear();
					clickCapt.call(node);
				}
			}
			game.removeScene=function(name){
				delete lib.storage.scene[name];
				game.save('scene',lib.storage.scene);
				_status.sceneChanged=true;
				for(var i=0;i<packnode.childElementCount;i++){
					if(packnode.childNodes[i].link=='scene_'+name){
						if(packnode.childNodes[i].classList.contains('active')){
							for(var j=0;j<packnode.childElementCount;j++){
								if(packnode.childNodes[j].link=='scene'){
									clickCapt.call(packnode.childNodes[j]);
								}
							}
						}
						packnode.childNodes[i].remove();
						break;
					}
				}
			}
			game.removeStage=function(name){
				delete lib.storage.stage[name];
				game.save('stage',lib.storage.stage);
				for(var i=0;i<packnode.childElementCount;i++){
					if(packnode.childNodes[i].link=='stage_'+name){
						if(packnode.childNodes[i].classList.contains('active')){
							for(var j=0;j<packnode.childElementCount;j++){
								if(get.is.empty(lib.storage.scene)){
									if(packnode.childNodes[j].link=='scene'){
										clickCapt.call(packnode.childNodes[j]);
									}
								}
								else{
									if(packnode.childNodes[j].link=='stage'){
										clickCapt.call(packnode.childNodes[j]);
									}
								}
							}
						}
						packnode.childNodes[i].remove();
						break;
					}
				}
			}
			var sceneNode;
			for(var i in lib.brawl){
				if(get.config(i)===false) continue;
				if(i=='scene'){
					sceneNode=createNode(i);
				}
				else{
					createNode(i);
				}
			}
			if(sceneNode){
				game.switchScene=function(){
					clickCapt.call(sceneNode);
				}
			}
			for(var i in lib.storage.scene){
				game.addScene(i);
			}
			for(var i in lib.storage.stage){
				game.addStage(i);
			}
			if(!lib.storage.currentBrawl){
				clickCapt.call(packnode.firstChild);
			}
			game.save('lastStage');
			if(lib.storage.directStage){
				var directStage=lib.storage.directStage;
				game.save('directStage');
				clickStart(directStage);
			}
			lib.init.onfree();
		},
		brawl:{
			huanhuazhizhan:{
				name:'幻化之战',
				mode:'identity',
				intro:[
					'杀死所有其他角色，成为最后的存活者',
					'所有角色改为四血白板，依靠灵力值获得技能。灵力值可以通过各种方式获得',
				],
				showcase:function(init){
					if(init){
						this.nodes=[];
					}
					else{
						while(this.nodes.length){
							this.nodes.shift().remove();
						}
					}
					var lx=this.offsetWidth/2-120;
					var ly=Math.min(lx,this.offsetHeight/2-60);
					var setPos=function(node){
						var i=node.index;
						var deg=Math.PI/4*i;
						var dx=Math.round(lx*Math.cos(deg));
						var dy=Math.round(ly*Math.sin(deg));
						node.style.transform='translate('+dx+'px,'+dy+'px)';
					}
					var characterz=['guyong','litong','mazhong','fuwan','chengpu','liaohua','xinxianying','liuyu'];
					for(var i=0;i<8;i++){
						var node=ui.create.player(null,true);
						this.nodes.push(node);
						node.init(characterz[i]);
						node.classList.add('minskin');
						node.node.marks.remove();
						node.node.hp.remove();
						node.node.count.remove();
						node.style.left='calc(50% - 60px)';
						node.style.top='calc(50% - 60px)';
						node.index=i;
						node.style.borderRadius='100%';
						node.node.avatar.style.borderRadius='100%';
						node.node.name.remove();
						setPos(node);
						this.appendChild(node);
					}
					var nodes=this.nodes;
					this.showcaseinterval=setInterval(function(){
						for(var i=0;i<nodes.length;i++){
							nodes[i].index++;
							if(nodes[i].index>7){
								nodes[i].index=0;
							}
							setPos(nodes[i]);
						}
					},1000);
				},
				init:function(){},
				content:{
					chooseCharacterBefore:function(){
					game.identityVideoName='幻化之战';
					var skills=[];
					var banned=[
						'xinfu_guhuo','reguhuo','jixi','duanchang','huashen','xinsheng','rehuashen','rexinsheng',
						'jinqu','nzry_binglve','nzry_huaiju','nzry_yili','nzry_zhenglun','nzry_mingren','nzry_zhenliang','drlt_qingce',
						'new_wuhun','qixing','kuangfeng','dawu','baonu','wumou','ol_wuqian','ol_shenfen','renjie','jilue','nzry_junlve','nzry_dinghuo','drlt_duorui',
						'chuanxin','cunsi',
						'jueqing','huilei','paiyi','fuhun','zhuiyi','olddanshou','yanzhu','juexiang','jiexun','bizhuan','tongbo',
						'xinfu_zhanji','xinfu_jijun','xinfu_fangtong',
						'xinfu_qianchong','pdgyinshi','shuliang',
						'zongkui','guju','bmcanshi','dingpan','xinfu_lingren','new_luoyan','junwei','gxlianhua',
						'qizhou','fenyue','dianhu','linglong','fenxin','mouduan',
						'cuorui','xinmanjuan','xinfu_jianjie','jianjie_faq','new_meibu','xinfu_xingzhao','jici',
						'xianfu','fenyong','xuehen','yingbin','midao','yishe','yinbing','juedi',
						'bushi','xinfu_dianhua','xinfu_falu','xinfu_zhenyi','lskuizhu','pingjian','xjshijian','fentian','zhiri','xindan',
						'xinzhengnan','xinfu_xiaode',
						'komari_xueshang','qiaosi_map',
					];
					var characters=[];
					for(var name in lib.character){
						if(!lib.character[name]) continue;
						if(lib.filter.characterDisabled(name)) continue;
						if(name.indexOf('old_')==0) continue;
						var skillsx=lib.character[name][3].slice(0);
						lib.character[name][2]=4;
						lib.character[name][3]=[];
						characters.push(name);
						var list=skillsx.slice(0);
						for(var j=0;j<skillsx.length;j++){
							var info=get.info(skillsx[j]);
							if(!info){
								skillsx.splice(j,1);
								list.splice(j--,1);
								continue;
							}
							if(typeof info.derivation=='string') list.push(info.derivation);
							else if(Array.isArray(info.derivation)) list.addArray(info.derivation);
						}
						for(var j=0;j<list.length;j++){
							if(skills.contains(list[j])||banned.contains(list[j])) continue;
							var info=get.info(list[j]);
							if(!info||info.zhuSkill||info.juexingji||info.charlotte||info.limited) continue;
							skills.push(list[j]);
						}
					}
					_status.characterlist=characters;
					var pack={
						skills:skills,
						pack:{
							card:{
								hhzz_toulianghuanzhu:{
									enable:true,
									cardimage:"toulianghuanzhu",
									chongzhu:true,
									type:'trick',
									filterTarget:function(card,player,target){
										return target.skillH.length>0;
									},
									content:function(){
										target.removeSkillH(target.skillH.randomGet());
										var skills=lib.huanhuazhizhan.skills;
										skills.randomSort();
										for(var i=0;i<skills.length;i++){
											if(!target.skillH.contains(skills[i])){
												target.addSkillH(skills[i]);
												break;
											}
										}
									},
									ai:{
										order:10,
										result:{
											target:function(){
												return 0.5-Math.random();
											},
										},
									},
								},
								hhzz_fudichouxin:{
									enable:true,
									cardimage:"fudichouxin",
									type:'trick',
									filterTarget:function(card,player,target){
										return target.skillH.length>0;
									},
									content:function(){
										target.removeSkillH(target.skillH.randomGet());
									},
									ai:{
										order:10,
										result:{target:-1},
									},
								},
							},
							character:{
								hhzz_shiona:['female','key',1,['hhzz_huilei']],
								hhzz_kanade:['female','key',2,['hhzz_youlian']],
								hhzz_takaramono1:['male','qun',5,['hhzz_jubao','hhzz_huizhen']],
								hhzz_takaramono2:['male','qun',3,['hhzz_jubao','hhzz_zhencang']],
							},
							skill:{
								_lingli_damage:{
									trigger:{source:'damage'},
									forced:true,
									popup:false,
									filter:function(event,player){
										return event.player==player._toKill;
									},
									content:function(){
										game.log(player,'对击杀目标造成了伤害');
										player.changeLingli(trigger.num);
									},
								},
								_lingli:{
								 mark:true,
								 marktext:'灵',
								 popup:'聚灵',
								 intro:{
								 	name:'灵力',
								 	content:'当前灵力点数：# / 5',
								 },
								 trigger:{
								 	player:'phaseBeginStart',
								 },
								 prompt:'是否消耗2点灵力获得一个技能？',
								 filter:function(event,player){
								 	return player.storage._lingli>1;
								 },
								 check:function(event,player){
								 	return player.skillH.length<3;
								 },
								 content:function(){
								 	'step 0'
								 	player.changeLingli(-2);
								 	'step 1'
								 	event.skills=lib.huanhuazhizhan.skills;
								 	var skills=event.skills;
								 	skills.randomSort();
								 	var list=[];
								 	for(var i=0;i<skills[i].length;i++){
								 		if(!player.skillH.contains(skills[i])) list.push(skills[i]);
								 		if(list.length==3) break;
								 	}
								 	if(!list.length){event.finish();return;}
								 	if(player.storage._lingli>0)	list.push('刷新');
								 	event.list=list;
								 	var dialog=game.getSkillDialog(event.list,'选择获得一个技能');
								 	player.chooseControl(event.list).set('ai',function(){
								 		return 0;
								 	}).dialog=dialog;
								 	'step 2'
							 		if(result.control=='刷新'){
							 			player.changeLingli(-1);
							 			event.goto(1);
							 			return;
							 		}
							 		event.skill=result.control;
							 		if(player.skillH.length==3){
									 	event.lose=true;
											player.chooseControl(player.skillH).prompt='选择失去1个已有技能';
							 		}
								 	'step 3'
								 	if(event.lose) player.removeSkillH(result.control);
								 	player.addSkillH(event.skill);
								 },
								},
								_lingli_round:{
									trigger:{global:'roundStart'},
									forced:true,
									popup:false,
									filter:function(event,player){
										return _status._aozhan!=true&&game.roundNumber>1;
									},
									content:function(){
										player.changeLingli(1);
									},
								},
								_lingli_draw:{
									enable:'phaseUse',
									filter:function(event,player){
										return player.storage._lingli>0;
									},
									content:function(){
										player.changeLingli(-1);
										player.draw();
									},
									delay:0,
									ai:{
										order:10,
										result:{
											player:function(player){
												return (player.storage._lingli-2*(3-player.skillH.length))>0?1:0;
											},
										},
									},
								},
								_lingli_save:{
									trigger:{target:'useCardToTargeted'},
									forced:true,
									popup:false,
									filter:function(event,player){
										return event.card.name=='tao'&&player==event.player._toSave;
									},
									content:function(){
										game.log(trigger.player,'帮助了保护目标');
										trigger.player.changeLingli(1);
									},
								},
								_hhzz_qiankunbagua:{
									trigger:{player:'phaseAfter'},
									forced:true,
									forceDie:true,
									popup:false,
									filter:function(event,player){
										return _status._aozhan&&!player.getStat('damage')&&player.isAlive()||event._lastDead!=undefined;
									},
									content:function(){
										'step 0'
										if(_status._aozhan&&!player.getStat('damage')){
											player.loseHp();
											player.changeLingli(1);
											game.log(player,'本回合内未造成伤害，触发死战模式惩罚');
										}
										if(trigger._lastDead==undefined) event.goto(2);
										'step 1'
										var type=get.rand(1,8);
										event.type=type;
										trigger._lastDead.playerfocus(1200);
										player.$fullscreenpop('乾坤八卦·'+['离','坎','乾','震','兑','艮','巽','坤'][type-1],get.groupnature(trigger._lastDead.group,'raw'));
										game.delay(1.5);
										'step 2'
										var type=event.type;
										switch(type){
											case 1:{
												game.countPlayer(function(current){
													current.loseHp();
												});
												break;
											}
											case 2:{
												game.countPlayer(function(current){
													current.draw(2,'nodelay');
												});
												break;
											}
											case 3:{
												trigger._lastDead.revive(3);
												trigger._lastDead.draw(3);
												break;
											}
											case 4:{
												game.countPlayer(function(current){
													var he=current.getCards('he');
													if(he.length) current.discard(he.randomGet()).delay=false;
												});
												break;
											}
											case 5:{
												game.countPlayer(function(current){
													current.changeLingli(1);
												});
												break;
											}
											case 6:{
												var cards=[];
												game.countPlayer(function(current){
													var card=get.cardPile(function(card){
														return !cards.contains(card)&&get.type(card)=='equip';
													});
													if(card){
														cards.push(card);
														current.$gain(card,'gain2')
														current.gain(card);
													}
												});
												break;
											}
											case 7:{
												game.countPlayer(function(current){
													if(current.skillH.length<3){
														var skills=lib.huanhuazhizhan.skills;
														skills.randomSort();
														for(var i=0;i<skills.length;i++){
															if(!current.skillH.contains(skills[i])){
																current.addSkillH(skills[i]);
																break;
															}
														}
													}
												});
												break;
											}
											case 8:{
												trigger._lastDead.revive(null,false);
												trigger._lastDead.uninit();
												trigger._lastDead.init(['hhzz_shiona','hhzz_kanade','hhzz_takaramono1','hhzz_takaramono2'].randomGet());
												trigger._lastDead.skillH=lib.character[trigger._lastDead.name][3].slice(0);
												trigger._lastDead.addSkill('hhzz_noCard');
												break;
											}
										}
										'step 3'
										if(game.playerx().length<=4&&!_status._aozhan){
											game.countPlayer2(function(current){
												delete current._toKill;
												delete current._toSave;
											});
											ui.huanhuazhizhan.innerHTML='死战模式';
											_status._aozhan=true;
											game.playBackgroundMusic();
											trigger._lastDead.$fullscreenpop('死战模式',get.groupnature(trigger._lastDead.group,'raw')||'fire');
										}
										else game.randomMission();
									},
								},
								hhzz_noCard:{
									mod:{
										cardEnabled:function(){return false},
										cardSavable:function(){return false},
										cardRespondable:function(){return false},
									},
								},
								hhzz_huilei:{
									trigger:{player:'die'},
									forced:true,
									forceDie:true,
									skillAnimation:true,
									logTarget:'source',
									filter:function(event,player){
										return event.source!=undefined;
									},
									content:function(){
										var source=trigger.source;
										var cards=source.getCards('he');
										if(cards.length) source.discard(cards);
									},
									ai:{
										effect:{
											target:function(card,player,target){
												if(get.tag(card,'damage')) return [-5,0];
											}
										}
									}
								},
								hhzz_youlian:{
									trigger:{player:'die'},
									forced:true,
									forceDie:true,
									skillAnimation:true,
									logTarget:'source',
									filter:function(event,player){
										return event.source!=undefined;
									},
									content:function(){
										var source=trigger.source;
										var cards=source.getCards('he');
										if(cards.length) source.discard(cards);
										var skills=source.skillH;
										if(skills.length) source.removeSkillH(skills.randomGet());
									},
									ai:{
										effect:{
											target:function(card,player,target){
												if(get.tag(card,'damage')) return [-5,0];
											}
										}
									}
								},
								hhzz_zhencang:{
									trigger:{player:'die'},
									forced:true,
									filter:function(event,player){
										return event.source!=undefined;
									},
									forceDie:true,
									logTarget:'source',
									content:function(){
										var source=trigger.source;
										source.draw();
										if(source.skillH.length==3) source.removeSkillH(source.skillH.randomGet());
										var skills=lib.huanhuazhizhan.skills;
										skills.randomSort();
										for(var i=0;i<skills.length;i++){
											if(!source.skillH.contains(skills[i])){
												source.addSkillH(skills[i]);
												break;
											}
										}
									},
								},
								hhzz_huizhen:{
									trigger:{player:'die'},
									forced:true,
									forceDie:true,
									logTarget:'source',
									filter:function(event,player){
										return event.source!=undefined;
									},
									content:function(){
										var source=trigger.source;
										source.draw(3);
										if(source.skillH.length==3) source.removeSkillH(source.skillH.randomGet());
										var skills=lib.huanhuazhizhan.skills;
										skills.randomSort();
										for(var i=0;i<skills.length;i++){
											if(!source.skillH.contains(skills[i])){
												source.addSkillH(skills[i]);
												break;
											}
										}
									},
								},
								hhzz_jubao:{
									trigger:{player:'damage'},
									forced:true,
									logTarget:'source',
									filter:function(event,player){
										return event.source!=undefined&&player.countCards('he')>0;
									},
									content:function(){
										var cards=player.getCards('he');
										cards.randomSort();
										cards=cards.slice(0,trigger.num);
										trigger.source.gain('give',cards,player);
									},
									ai:{
										effect:{
											target:function(card,player,target){
												if(get.tag(card,'damage')) return [15,0];
											}
										}
									}
								},
							},
							translate:{
								_lingli:'聚灵',
								_lingli_bg:'灵',
								_lingli_draw:'聚灵',
								hhzz_huilei:'挥泪',
								hhzz_youlian:'犹怜',
								hhzz_zhencang:'珍藏',
								hhzz_huizhen:'汇珍',
								hhzz_jubao:'聚宝',
								hhzz_huilei_info:'锁定技，杀死你的角色弃置所有的牌。',
								hhzz_youlian_info:'锁定技，杀死你的角色弃置所有牌并随机失去一个技能。',
								hhzz_zhencang_info:'锁定技，杀死你的角色摸一张牌并随机获得一个技能(已满则先随机移除一个)。',
								hhzz_huizhen_info:'锁定技，杀死你的角色摸三张牌并随机获得一个技能(已满则先随机移除一个)。',
								hhzz_jubao_info:'锁定技，当你受到伤害的点数确定时，伤害来源随机获得你区域内的X张牌（X为伤害点数）。',
								hhzz_shiona:'汐奈',
								hhzz_kanade:'立华奏',
								hhzz_takaramono1:'坚实宝箱',
								hhzz_takaramono2:'普通宝箱',
								hhzz_toulianghuanzhu:'偷梁换柱',
								hhzz_fudichouxin:'釜底抽薪',
								hhzz_toulianghuanzhu_info:'出牌阶段，对一名角色使用，随机更换其一个技能。可重铸。',
								hhzz_fudichouxin_info:'出牌阶段，对一名角色使用，随机弃置其一个技能。',
								nei:' ',
								nei2:' ',
								刷新_info:'消耗1点灵力值，刷新上述技能',
							},
						},
						get:{
							rawAttitude:function(from,to){
								if(from==to||to==from._toSave) return 10;
								if(to==from._toKill) return -30;
								return -10;
							}
						},
						eltc:{
							gameDraw:function(){
								var end=player;
								var numx;
								var num=function(player){
									return player._hSeat>5?5:4;
								};
								do{
									if(typeof num=='function'){
										numx=num(player);
									}
									if(player._hSeat>6) player.changeLingli(1);
									player.directgain(get.cards(numx));
									player=player.next;
								}
								while(player!=end);
							},
						},
						eltp:{
							addSkillH:function(skill){
								this.skillH.add(skill);
								this.addSkillLog.apply(this,arguments);
							},
							removeSkillH:function(skill){
								this.skillH.remove(skill);
								game.log(this,'失去了技能','#g【'+get.translation(skill)+'】');
								this.removeSkill(skill);
							},
							dieAfter:function(){
								var evt=_status.event.getParent('phase');
								if(evt) evt._lastDead=this;
								if(game.playerx().length==1) game.over(game.me.isAlive());
							},
							$dieAfter:function(){},
							hasUnknown:function(){return false},
							isUnknown:function(){return false},
							getEnemies:function(){
								var list=game.playerx();
								list.remove(this);
								return list;
							},
							dieAfter2:function(source){
								if(source&&this.name.indexOf('hhzz_')!=0){
									if(source._toKill==this) game.log(source,'击杀目标成功');
									source.draw(this==source._toKill?2:1);
									source.changeLingli(this==source._toKill?3:2);
								}
								if(!_status._aozhan){
									var that=this;
									game.countPlayer(function(current){
										if(current._toSave==that){
											game.log(current,'保护失败');
											var cards=current.getCards('he');
											if(cards.length) current.discard(cards.randomGets(4));
										}
									});
								}
							},
							logAi:function(){},
							hasZhuSkill:function(){return false},
							changeLingli:function(num){
								if(typeof num!='number') num=1;
								if(typeof this.storage._lingli!='number') this.storage._lingli=0;
								if(num>0){
									num=Math.min(num,5-this.storage._lingli);
									if(num<1) return;
									game.log(this,'获得了','#y'+get.cnNumber(num)+'点','灵力');
								}
								else{
									if(-num>this.storage._lingli) num=-this.storage._lingli;
									if(num==0) return;
									game.log(this,'失去了','#y'+get.cnNumber(-num)+'点','灵力');
								}
								this.storage._lingli+=num;
								this.markSkill('_lingli');
							},
						},
						game:{
							playerx:function(){
								return game.filterPlayer(function(current){
									if(current.name.indexOf('hhzz_')==0) return;
									return true;
								});
							},
							randomMission:function(){
								if(_status._aozhan) return;
								if(!ui.huanhuazhizhan){
									ui.huanhuazhizhan=ui.create.div('.touchinfo.left',ui.window);
									if(ui.time3) ui.time3.style.display='none';
								}
								var players=game.playerx();
								for(var i=0;i<players.length;i++){
									var player=players[i];
									var list=players.slice(0).randomSort();
									list.remove(player);
									player._toKill=list[0];
									player._toSave=list[1];
								}
								ui.huanhuazhizhan.innerHTML='击杀'+get.translation(game.me._toKill)+'，保护'+get.translation(game.me._toSave);
							},
							getSkillDialog:function(skills,prompt){
								var dialog=ui.create.dialog('hidden','forcebutton');
								if(prompt) dialog.addText(prompt);
								for(var i=0;i<skills.length;i++){
									dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【'+get.translation(skills[i])+'】</div><div>'+lib.translate[skills[i]+'_info']+'</div></div>');
								}
								dialog.addText(' <br> ');
								return dialog;
							},
							chooseCharacter:function(){
								var next=game.createEvent('chooseCharacter',false);
								next.showConfig=true;
								next.setContent(function(){
									'step 0'
									game.zhu=game.players.randomGet();
									var i=1;
									var current=game.zhu;
									while(true){
										current.skillH=[];
										current._hSeat=i;
										current.identity='nei';
										current.setNickname(get.cnNumber(i,true)+'号位');
										for(var ii in lib.huanhuazhizhan.eltp) current[ii]=lib.huanhuazhizhan.eltp[ii];
										current=current.next;
										i++;
										if(current==game.zhu) break;
									}
									ui.arena.classList.add('choose-character');
									game.me.chooseButton(['请选择角色形象',[_status.characterlist.randomRemove(5),'character']],true).onfree=true;
									'step 1'
									game.me.init(result.links[0]);
									var list=['xiandeng','shulv','xisheng'];
									game.me.chooseControl(list).dialog=game.getSkillDialog(list,'选择要获得的初始技能');
									'step 2'
									var list=['_lingli','_lingli_round','_lingli_draw','_lingli_save','_hhzz_qiankunbagua','_lingli_damage'];
									for(var i=0;i<list.length;i++){
										game.addGlobalSkill(list[i]);
									}
									game.me.addSkillH(result.control);
									game.countPlayer(function(current){
										if(!current.name){
											current.init(_status.characterlist.randomRemove(1)[0]);
											current.addSkillH(['xiandeng','shulv','xisheng'].randomGet());
										}
										current.storage._lingli=0;
										current.markSkill('_lingli');
									});
									game.showIdentity(true);
									'step 3'
									game.randomMission();
									var list=[
										game.createCard('hhzz_fudichouxin'),
										game.createCard('hhzz_toulianghuanzhu'),
										game.createCard('hhzz_toulianghuanzhu'),
										game.createCard('hhzz_toulianghuanzhu'),
									];
									for(var i=0;i<list.length;i++){
										ui.cardPile.insertBefore(list[i],ui.cardPile.childNodes[get.rand(ui.cardPile.childElementCount)]);
									}
									game.updateRoundNumber();
									'step 4'
									setTimeout(function(){	
										ui.arena.classList.remove('choose-character');
									},500);
									_status.videoInited=true;
									game.addVideo('arrangeLib',null,{
   							skill:{
   								_lingli_damage:{},
   								_lingli:{
   								 mark:true,
   								 marktext:'灵',
   								 popup:'聚灵',
   								 intro:{
   								 	name:'灵力',
   								 	content:'当前灵力点数：# / 5',
   								 },
   								},
   								_lingli_round:{},
   								_lingli_draw:{},
   								_lingli_save:{},
   								hhzz_noCard:{},
   								hhzz_huilei:{
   									skillAnimation:true,
   								},
   								hhzz_youlian:{
   									skillAnimation:true,
   								},
   								hhzz_zhencang:{},
   								hhzz_huizhen:{},
   								hhzz_jubao:{},
   							},
										card:{
											hhzz_toulianghuanzhu:{
												cardimage:"toulianghuanzhu",
											},
											hhzz_fudichouxin:{
												cardimage:"fudichouxin",
											},
										},
										character:{
											hhzz_shiona:['female','key',1,['hhzz_huilei']],
											hhzz_kanade:['female','key',2,['hhzz_youlian']],
											hhzz_takaramono1:['male','qun',5,['hhzz_jubao','hhzz_huizhen']],
											hhzz_takaramono2:['male','qun',3,['hhzz_jubao','hhzz_zhencang']],
										},
										translate:{
											_lingli:'聚灵',
											_lingli_bg:'灵',
											_lingli_draw:'聚灵',
											hhzz_huilei:'挥泪',
											hhzz_youlian:'犹怜',
											hhzz_zhencang:'珍藏',
											hhzz_huizhen:'汇珍',
											hhzz_jubao:'聚宝',
											hhzz_huilei_info:'锁定技，杀死你的角色弃置所有的牌。',
											hhzz_youlian_info:'锁定技，杀死你的角色弃置所有牌并随机失去一个技能。',
											hhzz_zhencang_info:'锁定技，杀死你的角色摸一张牌并随机获得一个技能(已满则先随机移除一个)。',
											hhzz_huizhen_info:'锁定技，杀死你的角色摸三张牌并随机获得一个技能(已满则先随机移除一个)。',
											hhzz_jubao_info:'锁定技，当你受到伤害的点数确定时，伤害来源随机获得你区域内的X张牌（X为伤害点数）。',
											nei:' ',
											nei2:' ',
											hhzz_shiona:'汐奈',
											hhzz_kanade:'立华奏',
											hhzz_takaramono1:'坚实宝箱',
											hhzz_takaramono2:'普通宝箱',
   								hhzz_toulianghuanzhu:'偷梁换柱',
   								hhzz_fudichouxin:'釜底抽薪',
   								hhzz_toulianghuanzhu_info:'出牌阶段，对一名角色使用，随机更换其一个技能。可重铸。',
   								hhzz_fudichouxin_info:'出牌阶段，对一名角色使用，随机弃置其一个技能。',
										},
									});
								});
							},
						},
					};
					var func=function(pack){
 					for(var i in pack.pack){
 						for(var j in pack.pack[i]) lib[i][j]=pack.pack[i][j];
 					}
 					for(var i in pack.eltc) lib.element.content[i]=pack.eltc[i];
 					for(var i in pack.eltp) lib.element.player[i]=pack.eltp[i];
 					for(var i in pack.game) game[i]=pack.game[i];
 					for(var i in pack.get) get[i]=pack.get[i];
 					lib.huanhuazhizhan=pack;
					}
					func(pack);
					},
				},
			},
			duzhansanguo:{
				name:'毒战三国',
				mode:'identity',
				intro:'牌堆中额外添加10%的毒',
				showcase:function(init){
					var node=this;
					var func=function(){
						var card=game.createCard('du','noclick');
						node.nodes.push(card);
						card.style.position='absolute';
						var rand1=Math.round(Math.random()*100);
						var rand2=Math.round(Math.random()*100);
						var rand3=Math.round(Math.random()*40)-20;
						card.style.left='calc('+rand1+'% - '+rand1+'px)';
						card.style.top='calc('+rand2+'% - '+rand2+'px)';
						card.style.transform='scale(0.8) rotate('+rand3+'deg)';
						card.style.opacity=0;
						node.appendChild(card);
						ui.refresh(card);
						card.style.opacity=1;
						card.style.transform='scale(1) rotate('+rand3+'deg)';
						if(node.nodes.length>7){
							setTimeout(function(){
								while(node.nodes.length>5){
									node.nodes.shift().delete();
								}
							},500);
						}
					};
					if(init){
						node.nodes=[];
						for(var i=0;i<5;i++){
							func();
						}
					}
					node.showcaseinterval=setInterval(func,1000);
				},
				content:{
					cardPile:function(list){
						game.identityVideoName='毒战三国杀';
						lib.config.bannedcards.remove('du');
						if(game.bannedcards) game.bannedcards.remove('du');
						var num=Math.ceil(list.length/10);
						while(num--){
							list.push([['heart','diamond','club','spade'].randomGet(),Math.ceil(Math.random()*13),'du']);
						}
						return list;
					}
				},
			},
			daozhiyueying:{
				name:'导师月英',
				mode:'identity',
				intro:'牌堆中所有普通锦囊牌数量翻倍；移除拥有集智技能的角色',
				showcase:function(init){
					var node=this;
					var player1,player2;
					if(init){
						player1=ui.create.player(null,true).init('huangyueying');
						player2=ui.create.player(null,true);
						if(lib.character.jsp_huangyueying){
							player2.init('jsp_huangyueying');
						}
						else if(lib.character.re_huangyueying){
							player2.init('re_huangyueying');
						}
						else{
							player2.init('huangyueying');
						}
						player1.style.left='20px';
						player1.style.top='20px';
						player1.style.transform='scale(0.9)';
						player1.node.count.innerHTML='2';
						player1.node.count.dataset.condition='mid';
						player2.style.left='auto';
						player2.style.right='20px';
						player2.style.top='20px';
						player2.style.transform='scale(0.9)';
						player2.node.count.innerHTML='2';
						player2.node.count.dataset.condition='mid';
						this.appendChild(player1);
						this.appendChild(player2);
						this.player1=player1;
						this.player2=player2;
					}
					else{
						player1=this.player1;
						player2=this.player2;
					}
					var rect1=player1.getBoundingClientRect();
					var rect2=player2.getBoundingClientRect();
					var left1=rect1.left+rect1.width/2-ui.arena.offsetLeft;
					var left2=rect2.left+rect2.width/2-ui.arena.offsetLeft;
					var top1=rect1.top+rect1.height/2-ui.arena.offsetTop;
					var top2=rect2.top+rect2.height/2-ui.arena.offsetTop;

					var createCard=function(wuxie){
						var card;
						if(wuxie){
							card=game.createCard('wuxie','noclick');
							card.style.transform='scale(0.9)';
						}
						else{
							card=ui.create.card(null,'noclick',true);
						}
						card.style.opacity=0;
						card.style.position='absolute';
						card.style.zIndex=2;
						card.style.margin=0;
						return card;
					}

					var func=function(){
						game.linexy([left1,top1,left2,top2]);
						var card=createCard(true);
						card.style.left='43px';
						card.style.top='58px';
						node.appendChild(card);
						ui.refresh(card);
						card.style.opacity=1;
						card.style.transform='scale(0.9) translate(137px,152px)';
						setTimeout(function(){
							card.delete();
						},1000);
						player1.node.count.innerHTML='1';

						setTimeout(function(){
							if(!node.showcaseinterval) return;
							player1.node.count.innerHTML='2';
							var card=createCard();
							card.style.left='43px';
							card.style.top='58px';
							card.style.transform='scale(0.9) translate(137px,152px)';
							node.appendChild(card);
							ui.refresh(card);
							card.style.opacity=1;
							card.style.transform='scale(0.9)';
							setTimeout(function(){
								card.delete();
							},1000);
						},300);

						setTimeout(function(){
							if(!node.showcaseinterval) return;
							player2.node.count.innerHTML='1';
							game.linexy([left2,top2,left1,top1]);
							var card=createCard(true);
							card.style.left='auto';
							card.style.right='43px';
							card.style.top='58px';
							node.appendChild(card);
							ui.refresh(card);
							card.style.opacity=1;
							card.style.transform='scale(0.9) translate(-137px,152px)';
							setTimeout(function(){
								card.delete();
							},700);

							setTimeout(function(){
								if(!node.showcaseinterval) return;
								player2.node.count.innerHTML='2';
								var card=createCard();
								card.style.left='auto';
								card.style.right='43px';
								card.style.top='58px';
								card.style.transform='scale(0.9) translate(-137px,152px)';
								node.appendChild(card);
								ui.refresh(card);
								card.style.opacity=1;
								card.style.transform='scale(0.9)';
								setTimeout(function(){
									card.delete();
								},700);
							},300);
						},1000);
					};
					node.showcaseinterval=setInterval(func,2200);
					func();
				},
				init:function(){
					for(var i in lib.character){
						var skills=lib.character[i][3]
						if(skills.contains('jizhi')||skills.contains('rejizhi')||skills.contains('lingzhou')||skills.contains('sbaiyin')){
							delete lib.character[i];
						}
					}
				},
				content:{
					cardPile:function(list){
						game.identityVideoName='导师月英';
						var list2=[];
						for(var i=0;i<list.length;i++){
							list2.push(list[i]);
							if(get.type(list[i][2])=='trick'){
								list2.push(list[i]);
							}
						}
						return list2;
					}
				}
			},
			weiwoduzun:{
				name:'唯我独尊',
				mode:'identity',
				intro:[
					'牌堆中杀的数量增加30%',
					'游戏开始时，主公获得一枚战神标记',
					'拥有战神标记的角色杀造成的伤害+1',
					'受到杀造成的伤害后战神印记将移到伤害来源的武将牌上'
				],
				showcase:function(init){
					var node=this;
					var player;
					if(init){
						player=ui.create.player(null,true);
						player.node.avatar.style.backgroundSize='cover';
						player.node.avatar.setBackgroundImage('image/mode/boss/character/boss_lvbu2.jpg');
						player.node.avatar.show();
						player.style.left='calc(50% - 75px)';
						player.style.top='20px';
						player.node.count.remove();
						player.node.hp.remove();
						player.style.transition='all 0.5s';
						node.appendChild(player);
						node.playernode=player;
					}
					else{
						player=node.playernode;
					}
					var num=0;
					var num2=0;
					this.showcaseinterval=setInterval(function(){
						var dx,dy
						if(num2%5==0){
							// player.animate('target');
							// player.animate('zoomin');
							player.classList.add('zoomin3');
							player.hide();
							player.style.transitionDuration='0.7s'
							setTimeout(function(){
								player.style.transitionProperty='none';
								player.classList.remove('zoomin3');
								player.classList.add('zoomout2');
								setTimeout(function(){
									player.style.transitionProperty='';
									player.classList.remove('zoomout2');
									player.show();
								},500);
							},700);
							for(var i=0;i<5;i++){
								switch(i){
									case 0:dx=-180;dy=0;break;
									case 1:dx=-140;dy=100;break;
									case 2:dx=0;dy=155;break;
									case 3:dx=140;dy=100;break;
									case 4:dx=180;dy=0;break;
								}
								var card=game.createCard('sha','noclick');
								card.style.left='calc(50% - 52px)';
								card.style.top='68px';
								card.style.position='absolute';
								card.style.margin=0;
								card.style.zIndex=2;
								card.style.opacity=0;
								node.appendChild(card);
								ui.refresh(card);
								card.style.opacity=1;
								card.style.transform='translate('+dx+'px,'+dy+'px)';
								setTimeout((function(card){
									return function(){
										card.delete();
									};
								})(card),700);
							}
						}
						num2++;
						if(num>=5){
							num=0;
						}
					},700);
				},
				init:function(){
					game.identityVideoName='唯我独尊';
					lib.skill.weiwoduzun={
						mark:true,
						intro:{
							content:'杀造成的伤害+1'
						},
						group:['weiwoduzun_damage','weiwoduzun_lose'],
						subSkill:{
							damage:{
								trigger:{source:'damageBegin'},
								forced:true,
								filter:function(event){
									return event.card&&event.card.name=='sha'&&event.notLink();
								},
								content:function(){
									trigger.num++;
								}
							},
							lose:{
								trigger:{player:'damageEnd'},
								forced:true,
								filter:function(event){
									return event.source&&event.source.isAlive();
								},
								content:function(){
									player.removeSkill('weiwoduzun');
									trigger.source.addSkill('weiwoduzun');
								}
							}
						}
					};
					lib.translate.weiwoduzun='战神';
					lib.translate.weiwoduzun_bg='尊';
				},
				content:{
					cardPile:function(list){
						var num=0;
						for(var i=0;i<list.length;i++){
							if(list[i][2]=='sha') num++;
						}
						num=Math.round(num*0.3);
						if(num<=0) return list;
						while(num--){
							var nature='';
							var rand=Math.random();
							if(rand<0.15){
								nature='fire';
							}
							else if(rand<0.3){
								nature='thunder';
							}
							var suit=['heart','spade','club','diamond'].randomGet();
							var number=Math.ceil(Math.random()*13);
							if(nature){
								list.push([suit,number,'sha',nature]);
							}
							else{
								list.push([suit,number,'sha']);
							}
						}
						return list;
					},
					gameStart:function(){
						if(_status.mode=='zhong'){
							game.zhong.addSkill('weiwoduzun');
						}
						else{
							game.zhu.addSkill('weiwoduzun');
						}
					}
				}
			},
			tongxingzhizheng:{
				name:'同姓之争',
				mode:'versus',
				submode:'2v2',
				intro:'姓氏相同的武将组合一队',
				showcase:function(init){
					var node=this;
					var getList=function(){
						var list=[['guanyu','guanping','guansuo','guanyinping'],
						['caocao','caopi','caozhi','caorui'],['liubei','liushan','liuchen'],
						['xiahouyuan','xiahouba','xiahoushi'],['sunjian','sunquan','sunce'],
						['sp_zhangjiao','zhangliang','zhangbao'],['zhugeliang','zhugeguo','zhugejin','zhugeke'],
						['mateng','machao','madai','mayunlu']];
						list.randomSort();
						var list2=[];
						for(var i=0;i<list.length;i++){
							list2=list2.concat(list[i]);
						}
						node.list=list2;
					};
					var func=function(){
						if(!node.list.length){
							getList();
						}
						var card=ui.create.player(null,true);
						card.init(node.list.shift());
						card.node.marks.remove();
						card.node.count.remove();
						card.node.hp.remove();
						node.nodes.push(card);
						card.style.position='absolute';
						var rand1=Math.round(Math.random()*100);
						var rand2=Math.round(Math.random()*100);
						var rand3=Math.round(Math.random()*40)-20;
						card.style.left='calc('+rand1+'% - '+(rand1*1.5)+'px)';
						card.style.top='calc('+rand2+'% - '+(rand2*1.8)+'px)';
						card.style.transform='scale(1.2) rotate('+rand3+'deg)';
						card.style.opacity=0;
						ui.refresh(card);
						node.appendChild(card);
						ui.refresh(card);
						card.style.transform='scale(0.9) rotate('+rand3+'deg)';
						card.style.opacity=1;
						if(node.nodes.length>4){
							setTimeout(function(){
								while(node.nodes.length>3){
									node.nodes.shift().delete();
								}
							},500);
						}
					};
					node.list=[];
					if(init){
						node.nodes=[];
						for(var i=0;i<3;i++){
							func();
						}
					}
					node.showcaseinterval=setInterval(func,1000);
				},
				init:function(){
					var map={};
					var map3=[];
					var list1=['司','夏','诸','皇'];
					var list2=['马','侯','葛','甫'];
					var exclude=['界','新','大','旧','☆','神'];
					for(var i in lib.character){
						if(lib.filter.characterDisabled(i)) continue;
						var surname=lib.translate[i];
						for(var j=0;j<surname.length;j++){
							if(exclude.contains(surname[j])) continue;
							if(!/[a-z]/i.test(surname[j])){
								var index=list1.indexOf(surname[j]);
								if(index!=-1&&surname[j+1]==list2[index]){
									surname=surname[j]+surname[j+1];
								}
								else{
									surname=surname[j];
								}
								break;
							}
						}
						if(!map[surname]){
							map[surname]=[];
						}
						map[surname].push(i);
					}
					for(var i in map){
						if(map[i].length<4){
							delete map[i];
						}
						else{
							map3.push(i);
						}
					}
					_status.brawl.map=map;
					_status.brawl.map3=map3;
				},
				content:{
					submode:'two',
					chooseCharacterFixed:true,
					chooseCharacter:function(list,player){
						game.versusVideoName='同姓之争';
						if(player.side==game.me.side){
							if(_status.brawl.mylist){
								return _status.brawl.mylist.randomGets(2);
							}
						}
						else{
							if(_status.brawl.enemylist){
								return _status.brawl.enemylist.randomGets(2);
							}
						}
						var surname=_status.brawl.map3.randomRemove();
						var list=_status.brawl.map[surname];
						if(player==game.me){
							_status.brawl.mylist=list;
						}
						else{
							_status.brawl.enemylist=list;
						}
						return list.randomRemove(2);
					}
				}
			},
			tongqueduopao:{
				name:'铜雀夺袍',
				mode:'identity',
				intro:[
					'主公必选曹操',
					'其余玩家从曹休、文聘、曹洪、张郃、夏侯渊、徐晃、许褚这些武将中随机选中一个',
					'游戏开始时将麒麟弓和爪黄飞电各置于每名角色的装备区内，大宛马洗入牌堆，移除其他的武器牌和坐骑牌'
				],
				init:function(){
					game.saveConfig('player_number','8','identity');
					game.saveConfig('double_character',false,'identity');
				},
				showcase:function(init){
					var node=this;
					var list=['caoxiu','wenpin','caohong','zhanghe','re_xiahouyuan','re_xuhuang','re_xuzhu'];
					list.randomSort();
					list.push('re_caocao');
					var func=function(){
						var card=ui.create.player(null,true);
						card.init(list.shift());
						card.node.marks.remove();
						card.node.count.remove();
						card.node.hp.remove();
						node.nodes.push(card);
						card.style.position='absolute';
						card.style.zIndex=2;
						card.style.transition='all 2s';
						var rand1=Math.round(Math.random()*100);
						var rand2=Math.round(Math.random()*100);
						var rand3=Math.round(Math.random()*40)-20;
						card.style.left='calc('+rand1+'% - '+(rand1*1.5)+'px)';
						card.style.top='calc('+rand2+'% - '+(rand2*1.8)+'px)';
						card.style.transform='scale(0.8) rotate('+rand3+'deg)';
						node.appendChild(card);
						ui.refresh(card);
					};

					var list2=['qilin','dawan','zhuahuang'];
					var func2=function(){
						var card=game.createCard(list2.shift(),'noclick');
						node.nodes.push(card);
						card.style.position='absolute';
						card.style.zIndex=2;
						card.style.transition='all 2s';
						var rand1=Math.round(Math.random()*100);
						var rand2=Math.round(Math.random()*100);
						var rand3=Math.round(Math.random()*40)-20;
						card.style.left='calc('+rand1+'% - '+rand1+'px)';
						card.style.top='calc('+rand2+'% - '+rand2+'px)';
						card.style.transform='rotate('+rand3+'deg)';
						node.appendChild(card);
						ui.refresh(card);
					};

					if(init){
						node.nodes=[];
					}
					else{
						while(node.nodes.length){
							node.nodes.shift().remove();
						}
					}
					for(var i=0;i<5;i++){
						func();
					}
					for(var i=0;i<3;i++){
						func2();
						func();
					}
					var func3=function(){
						for(var i=0;i<node.nodes.length;i++){
							var card=node.nodes[i];
							if(card.classList.contains('player')){
								var rand1=Math.round(Math.random()*100);
								var rand2=Math.round(Math.random()*100);
								var rand3=Math.round(Math.random()*40)-20;
								card.style.left='calc('+rand1+'% - '+(rand1*1.5)+'px)';
								card.style.top='calc('+rand2+'% - '+(rand2*1.8)+'px)';
								card.style.transform='scale(0.8) rotate('+rand3+'deg)';
							}
							else{
								var rand1=Math.round(Math.random()*100);
								var rand2=Math.round(Math.random()*100);
								var rand3=Math.round(Math.random()*40)-20;
								card.style.left='calc('+rand1+'% - '+rand1+'px)';
								card.style.top='calc('+rand2+'% - '+rand2+'px)';
								card.style.transform='rotate('+rand3+'deg)';
							}
						}
					}
					// func3();
					// node.showcaseinterval=setInterval(func3,5000);
				},
				content:{
					cardPile:function(list){
						for(var i=0;i<list.length;i++){
							var subtype=get.subtype(list[i][2]);
							if(subtype=='equip1'||subtype=='equip3'||subtype=='equip4'){
								list.splice(i--,1);
							}
						}
						for(var i=0;i<8;i++){
							list.push([['heart','diamond','club','spade'].randomGet(),Math.ceil(Math.random()*13),'dawan']);
						}
						return list;
					},
					gameStart:function(){
						game.identityVideoName='铜雀夺袍';
						for(var i=0;i<game.players.length;i++){
							game.players[i].$equip(game.createCard('qilin'));
							game.players[i].$equip(game.createCard('zhuahuang'));
						}
					},
					submode:'normal',
					list:['caoxiu','wenpin','caohong','zhanghe','re_xiahouyuan','re_xuhuang','re_xuzhu'],
					chooseCharacterFixed:true,
					chooseCharacterAi:function(player){
						if(player==game.zhu){
							player.init('re_caocao');
						}
						else{
							_status.brawl.list.remove(game.me.name);
							player.init(_status.brawl.list.randomRemove());
						}
					},
					chooseCharacter:function(){
						if(game.me==game.zhu){
							return ['re_caocao'];
						}
						else{
							_status.brawl.list.randomSort();
							return _status.brawl.list;
							// return _status.brawl.list.randomGets(1);
						}
					}
				}
			},
			// shenrudihou:{
			//	 name:'深入敌后',
			//	 mode:'versus',
			//	 submode:'1v1',
			//	 intro:'选将阶段选择武将和对战阶段选择上场的武将都由对手替你选择，而且你不知道对手为你选择了什么武将'
			// },
			tongjiangmoshi:{
				name:'同将模式',
				mode:'identity',
				intro:'玩家选择一个武将，所有角色均使用此武将',
				showcase:function(init){
					if(init){
						this.nodes=[];
					}
					else{
						while(this.nodes.length){
							this.nodes.shift().remove();
						}
					}
					var lx=this.offsetWidth/2-120;
					var ly=Math.min(lx,this.offsetHeight/2-60);
					var setPos=function(node){
						var i=node.index;
						var deg=Math.PI/4*i;
						var dx=Math.round(lx*Math.cos(deg));
						var dy=Math.round(ly*Math.sin(deg));
						node.style.transform='translate('+dx+'px,'+dy+'px)';
					}
					for(var i=0;i<8;i++){
						var node=ui.create.player(null,true);
						this.nodes.push(node);
						node.init('zuoci');
						node.classList.add('minskin');
						node.node.marks.remove();
						node.node.hp.remove();
						node.node.count.remove();
						node.style.left='calc(50% - 60px)';
						node.style.top='calc(50% - 60px)';
						node.index=i;
						node.style.borderRadius='100%';
						node.node.avatar.style.borderRadius='100%';
						node.node.name.remove();
						setPos(node);
						this.appendChild(node);
					}
					var nodes=this.nodes;
					this.showcaseinterval=setInterval(function(){
						for(var i=0;i<nodes.length;i++){
							nodes[i].index++;
							if(nodes[i].index>7){
								nodes[i].index=0;
							}
							setPos(nodes[i]);
						}
					},1000);
				},
				content:{
					gameStart:function(){
						game.identityVideoName='同将模式';
						var target=(_status.mode=='zhong')?game.zhong:game.zhu;
						if(get.config('double_character')){
							target.init(game.me.name,game.me.name2);
						}
						else{
							target.init(game.me.name);
						}
						target.hp++;
						target.maxHp++;
						target.update();
					},
					chooseCharacterAi:function(player,list,list2,back){
						if(player==game.zhu){
							return;
						}
						else{
							if(get.config('double_character')){
								player.init(game.me.name,game.me.name2);
							}
							else{
								player.init(game.me.name);
							}
						}
					},
					chooseCharacter:function(list,list2,num){
						if(game.me!=game.zhu){
							return list.slice(0,list2);
						}
						else{
							if(_status.event.zhongmode){
								return list.slice(0,6);
							}
							else{
								return list.concat(list2.slice(0,num));
							}
						}
					}
				}
			},
			jiazuzhizheng:{
				name:'家族之争',
				mode:'versus',
				submode:'2v2',
				intro:'势力相同的武将组合一队，获得专属势力技能',
				showcase:function(init){
					var node=this;
					var getList=function(){
						var list=[
						['liubei','guanyu','zhangfei'],
						['caocao','guojia','xunyu'],
						['sunquan','zhangzhang','zhouyu'],
						['re_yuanshao','guotufengji','yj_jushou']
						];
						if(_status.forceKey) list.push(['key_yuri','key_kyousuke','key_umi'])
						list.randomSort();
						var list2=[];
						for(var i=0;i<list.length;i++){
							list2=list2.concat(list[i]);
						}
						node.list=list2;
					};
					var func=function(){
						if(!node.list.length){
							getList();
						}
						var card=ui.create.player(null,true);
						card.init(node.list.shift());
						card.node.marks.remove();
						card.node.count.remove();
						card.node.hp.remove();
						node.nodes.push(card);
						card.style.position='absolute';
						var rand1=Math.round(Math.random()*100);
						var rand2=Math.round(Math.random()*100);
						var rand3=Math.round(Math.random()*40)-20;
						card.style.left='calc('+rand1+'% - '+(rand1*1.5)+'px)';
						card.style.top='calc('+rand2+'% - '+(rand2*1.8)+'px)';
						card.style.transform='scale(1.2) rotate('+rand3+'deg)';
						card.style.opacity=0;
						ui.refresh(card);
						node.appendChild(card);
						ui.refresh(card);
						card.style.transform='scale(0.9) rotate('+rand3+'deg)';
						card.style.opacity=1;
						if(node.nodes.length>4){
							setTimeout(function(){
								while(node.nodes.length>3){
									node.nodes.shift().delete();
								}
							},500);
						}
					};
					node.list=[];
					if(init){
						node.nodes=[];
						for(var i=0;i<3;i++){
							func();
						}
					}
					node.showcaseinterval=setInterval(func,1000);
				},
				init:function(){},
				content:{
					submode:'two',
					chooseCharacterFixed:true,
 				chooseCharacterBefore:function(){
 					game.versusVideoName='家族之争';
 					var map={
 						wei:[],
 						shu:[],
 						wu:[],
 						qun:[],
 						key:[],
 					};
 					var map3=[];
 					var banned=['zuoci','re_zuoci','tw_xiahouba'];
 					for(var i in lib.character){
 						if(lib.filter.characterDisabled2(i)||lib.filter.characterDisabled(i)||banned.contains(i)) continue;
 						var group=lib.character[i][1];
 						if(group&&map[group]) map[group].push(i);
 					}
 					for(var i in map){
 						if(map[i].length<8||(i=='key'&&!_status.forceKey)){
 							delete map[i];
 						}
 						else{
 							map3.push(i);
 						}
 					}
 					_status.brawl.map=map;
 					_status.brawl.map3=map3;
 					var skill={
 						_jiazu_wei:{
 							trigger:{player:'phaseBegin'},
 							direct:true,
 							popup:'魏业',
 							prompt2:'回合开始时，你可以弃置一张牌并指定一名敌方角色，该角色须弃置一张牌，否则你摸一张牌。',
 							filter:function(event,player){
 								return player.group=='wei'&&player.countCards('he')>0;
 							},
 							content:function(){
 								'step 0'
 								player.chooseCardTarget({
 									prompt:get.prompt2(event.name),
 									filterCard:lib.filter.cardDiscardable,
 									filterTarget:function(card,player,target){
 										return player.side!=target.side;
 									},
 									position:'he',
 									ai1:function(card){
 										return 6-get.value(card);
 									},
 									ai2:function(target){
 										return 1/(1+target.countCards('he'));
 									},
 								});
 								'step 1'
 								if(result.bool){
 									player.logSkill(event.name,result.targets);
 									player.discard(result.cards);
 									result.targets[0].chooseToDiscard('弃置一张牌，或令'+get.translation(player)+'摸一张牌','he').ai=lib.skill.zhiheng.check;
 								}
 								else event.finish();
 								'step 2'
 								if(!result.bool) player.draw();
 							},
 						},
 						_jiazu_shu:{
 							popup:'蜀义',
 							prompt2:'你使用【杀】上限+1；出牌阶段结束时，若你于此阶段使用【杀】次数不少于2，摸一张牌。',
 							mod:{
 								cardUsable:function(card,player,num){
 									if(card.name=='sha'&&player.group=='shu') return num+1;
 								},
 							},
 							trigger:{player:'phaseUseEnd'},
 							forced:true,
 							filter:function(event,player){
 								return player.group=='shu'&&player.getHistory('useCard',function(evt){
 									return evt.card&&evt.card.name=='sha'&&evt.getParent('phaseUse')==event;
 								}).length>1;
 							},
 							content:function(){player.draw()},
 						},
 						_jiazu_wu:{
 							trigger:{player:'phaseEnd'},
 							forced:true,
 							popup:'吴耀',
 							prompt2:'回合结束时，若你的手牌数不等于你的体力值，则你摸一张牌。',
 							filter:function(event,player){
 								return player.group=='wu'&&player.countCards('h')!=player.hp;
 							},
 							content:function(){player.draw()},
 						},
 						_jiazu_qun:{
 							popup:'群心',
 							prompt2:'锁定技，弃牌阶段开始时，若你的手牌数比体力值多2或更多，你本回合手牌上限+1；若你已损失体力值大于1，你手牌上限+1',
 							trigger:{player:'phaseDiscardBegin'},
 							forced:true,
 							filter:function(event,player){
 								return player.group=='qun'&&(player.isDamaged()||player.countCards('h')-player.hp>1);
 							},
 							content:function(){
 								var num=0;
 								if(player.isDamaged()) num++;
 								if(player.countCards('h')-player.hp>1) num++;
 								player.addMark('qunxin_temp',num,false);
 								player.addTempSkill('qunxin_temp','phaseDiscardEnd');
 							},
 						},
 						_jiazu_key:{
 							enable:'phaseUse',
 							usable:1,
 							popup:'键魂',
 							filter:function(event,player){
 								return player.group=='key';
 							},
 							prompt2:'出牌阶段限一次，你可以摸一张牌并获得1点护甲。若如此做，你于当前回合结束时失去1点体力。',
 							content:function(){
 								"step 0"
 								player.draw();
 								"step 1"
 								player.changeHujia(1);
 								"step 2"
 								var evt=event.getParent('phase');
 								if(evt&&evt.after){
 									var next=player.loseHp();
 									event.next.remove(next);
 									evt.after.push(next);
 								}
 							},
 							ai:{
 								order:10,
 								result:{
 									player:function(player){
 										return player.hp-1;
 									},
 								},
 							},
 						},
 						qunxin_temp:{
 							noGlobal:true,
 							onremove:true,
 							mod:{
 								maxHandcard:function(player,num){
 									return num+player.countMark('qunxin_temp');
 								},
 							},
 						},
 						_jiazu_awaken_wei:{
 							popup:'许昌',
 							intro:{
 								content:'锁定技，当你受到伤害后，你摸一张牌。',
 							},
 							trigger:{player:'damageEnd'},
 							forced:true,
 							filter:function(event,player){
 								return player._jiazuAwaken&&player.group=='wei';
 							},
 							content:function(){player.draw()},
 						},
 						_jiazu_awaken_shu:{
 							popup:'成都',
 							intro:{
 								content:'锁定技，当你使用【杀】造成伤害后，你摸一张牌。',
 							},
 							trigger:{source:'damageEnd'},
 							forced:true,
 							filter:function(event,player){
 								return player._jiazuAwaken&&player.group=='shu'&&event.card&&event.card.name=='sha';
 							},
 							content:function(){player.draw()},
 						},
 						_jiazu_awaken_wu:{
 							popup:'武昌',
 							intro:{
 								content:'锁定技，当你使用装备牌时，你摸一张牌。',
 							},
 							trigger:{player:'useCard'},
 							forced:true,
 							filter:function(event,player){
 								return player._jiazuAwaken&&player.group=='wu'&&get.type(event.card)=='equip';
 							},
 							content:function(){player.draw()},
 						},
 						_jiazu_awaken_qun:{
 							popup:'邺城',
 							intro:{
 								content:'锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。',
 							},
 							trigger:{player:'useCardToPlayered'},
 							forced:true,
 							filter:function(event,player){
 								if(!player._jiazuAwaken||player.group!='qun'||!event.isFirstTarget||get.type(event.card,'trick')!='trick') return false;
 								for(var i=0;i<event.targets.length;i++){
 									if(event.targets[i]!=player) return true;
 								}
 								return false;
 							},
 							content:function(){player.draw()},
 						},
 						_jiazu_awaken_key:{
 							popup:'光坂',
 							intro:{
 								content:'锁定技，当你回复/失去体力后，你摸一张牌。',
 							},
 							trigger:{player:['loseHpEnd','recoverEnd']},
 							forced:true,
 							filter:function(event,player){
 								return player._jiazuAwaken&&player.group=='key';
 							},
 							content:function(){
 								player.draw();
 							},
 						},
 						_jiazu_awaken:{
 							trigger:{global:'die'},
 							forced:true,
 							filter:function(event,player){
 								return !player._jiazuAwaken&&event.player.side==player.side;
 							},
 							content:function(){
 								player._jiazuAwaken=true;
 								var name='_jiazu_awaken_'+player.group;
 								if(lib.skill[name]) player.markSkill(name);
 							},
 						},
 					};
 					var translate={};
 					for(var i in skill){
 						lib.skill[i]=skill[i];
 						if(skill[i].popup){
 							lib.translate[i]=skill[i].popup;
 							translate[i]=skill[i].popup;
 						}
 						if(skill[i].prompt2){
 							lib.translate[i+'_info']=skill[i].prompt2;
 							translate[i+'_info']=skill[i].prompt2;
 						}
 						if(!skill[i].noGlobal) game.addGlobalSkill(i);
 					};
 					game.addVideo('arrangeLib',null,{
 						skill:{
  						_jiazu_wei:{
  							popup:'魏业',
  							prompt2:'回合开始时，你可以弃置一张牌并指定一名敌方角色，该角色须弃置一张牌，否则你摸一张牌。',
  						},
  						_jiazu_shu:{
  							popup:'蜀义',
  							prompt2:'你使用【杀】上限+1；出牌阶段结束时，若你于此阶段使用【杀】次数不少于2，摸一张牌。',
  						},
  						_jiazu_wu:{
  							popup:'吴耀',
  							prompt2:'回合结束时，若你的手牌数不等于你的体力值，则你摸一张牌。',
  						},
  						_jiazu_qun:{
  							popup:'群心',
  							prompt2:'锁定技，弃牌阶段开始时，若你的手牌数比体力值多2或更多，你本回合手牌上限+1；若你已损失体力值大于1，你手牌上限+1',
  						},
  						_jiazu_key:{
  							popup:'键魂',
  							prompt2:'出牌阶段限一次，你可以摸一张牌并获得1点护甲。若如此做，你于当前回合结束时失去1点体力。',
  						},
  						_jiazu_awaken_wei:{
  							popup:'许昌',
  							intro:{
  								content:'锁定技，当你受到伤害后，你摸一张牌。',
  							},
  						},
  						_jiazu_awaken_shu:{
  							popup:'成都',
  							intro:{
  								content:'锁定技，当你使用【杀】造成伤害后，你摸一张牌。',
  							},
  						},
  						_jiazu_awaken_wu:{
  							popup:'武昌',
  							intro:{
  								content:'锁定技，当你使用装备牌时，你摸一张牌。',
  							},
  						},
  						_jiazu_awaken_qun:{
  							popup:'邺城',
  							intro:{
  								content:'锁定技，当你使用锦囊牌指定其他角色为目标后，你摸一张牌。',
  							},
  						},
  						_jiazu_awaken_key:{
  							popup:'光坂',
  							intro:{
  								content:'锁定技，当你回复/失去体力后，你摸一张牌。',
  							},
  						},
  						_jiazu_awaken:{},
 						},
 						translate:translate,
 					});
					},
					chooseCharacter:function(list,player){
						if(player.side==game.me.side){
							if(_status.brawl.mylist){
								return _status.brawl.mylist.randomGets(player==game.me?5:3);
							}
						}
						else{
							if(_status.brawl.enemylist){
								return _status.brawl.enemylist.randomGets(player==game.me?5:3);
							}
						}
						var surname=_status.brawl.map3.randomRemove();
						var list=_status.brawl.map[surname];
						if(player==game.me){
							_status.brawl.mylist=list;
						}
						else{
							_status.brawl.enemylist=list;
						}
						return list.randomRemove(player==game.me?5:3);
					}
				}
			},
			baiyidujiang:{
				name:'白衣渡江',
				mode:'versus',
				submode:'2v2',
				showcase:function(init){
					var node=this;
					var player1,player2;
					if(init){
						player1=ui.create.player(null,true).init('lvmeng');
						player2=ui.create.player(null,true).init('guanyu');
						player1.node.marks.remove();
						player1.node.hp.remove();
						player2.node.marks.remove();
						player2.node.hp.remove();
						player1.style.left='20px';
						player1.style.top='20px';
						player1.style.transform='scale(0.9)';
						player1.node.count.remove();
						player2.style.left='auto';
						player2.style.right='20px';
						player2.style.top='20px';
						player2.style.transform='scale(0.9)';
						player2.node.count.remove();
						this.appendChild(player1);
						this.appendChild(player2);
						this.player1=player1;
						this.player2=player2;
					}
					else{
						player1=this.player1;
						player2=this.player2;
					}
					var rect1=player1.getBoundingClientRect();
					var rect2=player2.getBoundingClientRect();
					var left1=rect1.left+rect1.width/2-ui.arena.offsetLeft;
					var left2=rect2.left+rect2.width/2-ui.arena.offsetLeft;
					var top1=rect1.top+rect1.height/2-ui.arena.offsetTop;
					var top2=rect2.top+rect2.height/2-ui.arena.offsetTop;
					var func=function(){
						//game.linexy([left1,top1,left2,top2]);
						setTimeout(function(){
							player1.reinit(player1.name,'re_lvmeng');
							player2.reinit(player2.name,'re_guanyu');
							//game.linexy([left2,top2,left1,top1],'green');
						},1500);
						setTimeout(function(){
							player1.reinit(player1.name,'sp_lvmeng');
							player2.reinit(player2.name,'jsp_guanyu');
							//game.linexy([left1,top1,left2,top2],'thunder');
						},3000);
						setTimeout(function(){
							player1.reinit(player1.name,'shen_lvmeng');
							player2.reinit(player2.name,'shen_guanyu');
							//game.linexy([left2,top2,left1,top1],'fire');
						},4500);
						setTimeout(function(){
							player1.reinit(player1.name,'lvmeng');
							player2.reinit(player2.name,'guanyu');
						},6000);
					};
					node.showcaseinterval=setInterval(func,6000);
					func();
				},
				intro:[
					'玩家在选将时可从8张武将牌里选择两张武将牌，一张面向大家可见（加入游戏），另一张是隐藏面孔（暗置）',
					'选择的两张武将牌需满足以下至少两个条件：1.性别相同；2.体力上限相同；3.技能数量相同',
					'每名玩家在其回合开始或回合结束时，可以选择将自己的武将牌弃置，然后使用暗置的武将牌进行剩余的游戏'
				],
				content:{
					submode:'two',
					chooseCharacterBefore:function(){
   			game.versusVideoName='白衣渡江';
   			lib.skill._changeCharacter={
   				trigger:{player:['phaseBefore','phaseAfter']},
   				forced:true,
   				silent:true,
   				popup:false,
   				filter:function(event,player){
   					return player._backupCharacter!=undefined;
   				},
   				content:function(){
   					"step 0"
   					player.chooseControl('确定','取消').set('dialog',['是否替换自己的武将牌？',[[player._backupCharacter],'character']]).set('ai',function(){
   						return Math.random()<0.15?'确定':'取消';
   					});
   					"step 1"
   					if(result.control=='确定'){
   						game.log(player,'将',player.name,'替换为了',player._backupCharacter);
   						player.reinit(player.name,player._backupCharacter);
   						player.changeGroup(lib.character[player._backupCharacter][1],false);
   						delete player._backupCharacter;
   					}
   				},
   			},
   			game.addGlobalSkill('_changeCharacter');
   			game.chooseCharacterTwo=function(){
   				var next=game.createEvent('chooseCharacter',false);
   				next.setContent(function(){
   					'step 0'
   					ui.arena.classList.add('choose-character');
   					for(var i in lib.skill){
   						if(lib.skill[i].changeSeat){
   							lib.skill[i]={};
   							if(lib.translate[i+'_info']){
   								lib.translate[i+'_info']='此模式下不可用';
   							}
   						}
   					}
   					var bool=Math.random()<0.5;
   					var bool2=Math.random()<0.5;
   					var ref=game.players[0];
   
   					ref.side=bool;
   					ref.next.side=bool2;
   					ref.next.next.side=!bool;
   					ref.previous.side=!bool2;
   
   					var firstChoose=game.players.randomGet();
   					if(firstChoose.next.side==firstChoose.side){
   						firstChoose=firstChoose.next;
   					}
   					_status.firstAct=firstChoose;
   					for(var i=0;i<4;i++){
   						firstChoose.node.name.innerHTML=get.verticalStr(get.cnNumber(i+1,true)+'号位');
   						firstChoose=firstChoose.next;
   					}
   
   					for(var i=0;i<game.players.length;i++){
   						if(game.players[i].side==game.me.side){
   							game.players[i].node.identity.firstChild.innerHTML='友';
   						}
   						else{
   							game.players[i].node.identity.firstChild.innerHTML='敌';
   						}
   						game.players[i].node.identity.dataset.color=game.players[i].side+'zhu';
   					}
   					var list=[];
   					for(i in lib.character){
   						if(!lib.filter.characterDisabled(i)){
   							list.push(i);
   						}
   					}
   					var choose=[];
   					_status.characterlist=list;
   					event.filterChoice=function(name1,name2){
   						var info1=lib.character[name1];
   						var info2=lib.character[name2];
   						if(!info1||!info2) return;
   						var num=0;
   						if(info1[0]==info2[0]) num++;
   						if(get.infoMaxHp(info1[2])==get.infoMaxHp(info2[2])) num++;
   						if(info1[3].length==info2[3].length) num++;
   						return num>1;
   					};
   					var list2=list.randomGets(8);
   					var next=game.me.chooseButton(2,true,['请选择您的武将牌',[list2,'character']]);
   					next.set('onfree',true);
   					next.set('filterButton',function(button){
   						if(!ui.selected.buttons.length){
   							for(var i=0;i<list2.length;i++){
   								if(list2[i]!=button.link&&event.filterChoice(button.link,list2[i])) return true;
   							}
   							return false;
   						}
   						return event.filterChoice(button.link,ui.selected.buttons[0].link)
   					});
   					'step 1'
   					game.me.init(result.links[0]);
   					game.me._backupCharacter=result.links[1];
   					_status.characterlist.removeArray(result.links);
   					var list=_status.characterlist;
   					for(var i=0;i<game.players.length;i++){
   						if(game.players[i]!=game.me){
   							list.randomSort();
   							var bool=false;
   							for(var k=0;k<list.length;k++){
   								for(var j=i+1;j<list.length;j++){
   									if(event.filterChoice(list[k],list[j])){
   										bool=true;
   										game.players[i].init(list[k]);
   										game.players[i]._backupCharacter=list[j];
   										break;
   									}
   								}
   								if(bool) break;
   							}
   						}
   					}
   					setTimeout(function(){
   						ui.arena.classList.remove('choose-character');
   					},500);
   				});
   			};
					}
				}
			},
			scene:{
				name:'创建场景',
				content:{
					submode:'normal'
				},
				nostart:true,
				fullshow:true,
				template:{
					mode:'identity',
					init:function(){
						game.saveConfig('double_character',false,'identity');
						_status.brawl.playerNumber=_status.brawl.scene.players.length;
					},
					showcase:function(init){
						if(init){
							var name=lib.brawl[this.link].name;
							var scene=lib.storage.scene[name];
							ui.create.node('button','编辑场景',this,function(){
								_status.sceneToLoad=scene;
								game.switchScene();
							});
							if(_status.extensionmade.contains(name)){
								ui.create.node('button','管理扩展',this,function(){
									ui.click.configMenu();
									ui.click.extensionTab(name);
								},{marginLeft:'6px'});
							}
							else{
								ui.create.node('button','删除场景',this,function(){
									if(confirm('确定删除'+name+'？')){
										game.removeScene(name);
									}
								},{marginLeft:'6px'});
							}
							ui.create.node('button','导出扩展',this,function(){
								var str='{name:"'+name+'",content:function(){\nif(lib.config.mode=="brawl"){\n'+
								'if(!lib.storage.scene) lib.storage.scene={};\n'+
								'if(!lib.storage.scene["'+name+'"]){\nlib.storage.scene["'+name+'"]='+get.stringify(scene)+';\n_status.extensionscene=true;}\n'+
								'if(!_status.extensionmade) _status.extensionmade=[];\n'+
								'_status.extensionmade.push("'+name+'");\n}}\n}';
								var extension={'extension.js':'game.import("extension",function(lib,game,ui,get,ai,_status){return '+str+'})'};
								game.importExtension(extension,null,name);
							},{marginLeft:'6px'});
						}
					},
					content:{
						submode:'normal',
						noAddSetting:true,
						identityShown:true,
						orderedPile:true,
						cardPile:function(list){
							list.randomSort();
							var scene=_status.brawl.scene;
							var inpile=[];
							for(var i=0;i<list.length;i++){
								if(lib.card[list[i][2]]){
									if(lib.config.bannedcards.contains(list[i][2])) continue;
									if(game.bannedcards&&game.bannedcards.contains(list[i][2])) continue;
									inpile.add(list[i][2]);
								}
							}
							var parseInfo=function(info){
								var info2=[];
								if(info[1]=='random'){
									info2.push(['club','spade','heart','diamond'].randomGet());
								}
								else{
									info2.push(info[1]);
								}
								if(info[2]=='random'){
									info2.push(Math.ceil(Math.random()*13));
								}
								else{
									info2.push(info[2]);
								}
								if(info[0]=='random'){
									info2.push(inpile.randomGet());
								}
								else{
									info2.push(info[0]);
								}
								return info2;
							}
							if(scene.replacepile){
								list.length=0;
							}
							for(var i=scene.cardPileTop.length-1;i>=0;i--){
								list.unshift(parseInfo(scene.cardPileTop[i]));
							}
							for(var i=0;i<scene.cardPileBottom.length;i++){
								list.push(parseInfo(scene.cardPileBottom[i]));
							}
							for(var i=0;i<scene.discardPile.length;i++){
								ui.create.card(ui.discardPile).init(parseInfo(scene.discardPile[i]));
							}
							return list;
						},
						gameStart:function(){
							for(var i=0;i<game.players.length;i++){
								game.players[i].node.marks.show();
								game.players[i].node.name.show();
								game.players[i].node.name2.show();
								var info=game.players[i].brawlinfo;
								if(info.maxHp){
									game.players[i].maxHp=info.maxHp;
									if(game.players[i].hp>game.players[i].maxHp){
										game.players[i].hp=game.players[i].maxHp;
									}
								}
								if(info.hp){
									game.players[i].hp=info.hp;
									if(game.players[i].hp>game.players[i].maxHp){
										game.players[i].maxHp=game.players[i].hp;
									}
								}
								game.players[i].update();
							}
							var scene=_status.brawl.scene;
							var over=function(str){
								switch(str){
									case 'win':game.over(true);break;
									case 'lose':game.over(false);break;
									case 'tie':game.over('平局');break;
								}
							}
							if(scene.turns){
								var turns=scene.turns[0];
								lib.onphase.push(function(){
									turns--;
									if(turns<0){
										over(scene.turns[1]);
									}
								});
							}
							if(scene.washes){
								var washes=scene.washes[0];
								lib.onwash.push(function(){
									washes--;
									if(washes<=0){
										over(scene.washes[1]);
									}
								});
							}
						},
						chooseCharacterBefore:function(){
							var scene=_status.brawl.scene;
							var playercontrol=[];
							var maxpos=0;
							for(var i=0;i<scene.players.length;i++){
								if(scene.players[i].playercontrol){
									playercontrol.push(scene.players[i]);
								}
								maxpos=Math.max(maxpos,scene.players[i].position);
							}

							if(maxpos<scene.players.length){
								maxpos=scene.players.length;
							}
							var posmap=[];
							for(var i=1;i<=maxpos;i++){
								posmap.push(i);
							}
							for(var i=0;i<scene.players.length;i++){
								if(scene.players[i].position){
									posmap.remove(scene.players[i].position);
								}
							}
							for(var i=0;i<scene.players.length;i++){
								if(!scene.players[i].position){
									scene.players[i].position=posmap.randomRemove();
								}
							}
							if(playercontrol.length){
								game.me.brawlinfo=playercontrol.randomGet();
							}
							else{
								game.me.brawlinfo=scene.players.randomGet();
							}
							var getpos=function(info){
								var dp=info.position-game.me.brawlinfo.position;
								if(dp<0){
									dp+=maxpos;
								}
								return dp;
							};
							scene.players.sort(function(a,b){
								return getpos(a)-getpos(b);
							});
							var target=game.me;
							var createCard=function(info){
								var info2=[];
								if(info[1]=='random'){
									info2.push(['club','spade','heart','diamond'].randomGet());
								}
								else{
									info2.push(info[1]);
								}
								if(info[2]=='random'){
									info2.push(Math.ceil(Math.random()*13));
								}
								else{
									info2.push(info[2]);
								}
								if(info[0]=='random'){
									info2.push(lib.inpile.randomGet());
								}
								else{
									info2.push(info[0]);
								}
								return ui.create.card().init(info2);
							}
							_status.firstAct=game.me;
							for(var i=0;i<scene.players.length;i++){
								var info=scene.players[i];
								target.brawlinfo=info;
								target.identity=info.identity;
								target.setIdentity(info.identity);
								target.node.marks.hide();
								if(info.name2!='none'&&info.name2!='random'){
									if(info.name=='random'){
										target.init(info.name2,info.name2);
										target.node.name.hide();
										target.node.avatar.hide();
									}
									else{
										target.init(info.name,info.name2);
									}
								}
								else{
									if(info.name!='random'){
										if(info.name2=='random'){
											target.init(info.name,info.name);
											target.node.name2.hide();
											target.node.avatar2.hide();
										}
										else{
											target.init(info.name);
										}
									}
								}
								if(info.linked) target.classList.add('linked');
								if(info.turnedover) target.classList.add('turnedover');
								if(info.position<_status.firstAct.brawlinfo.position) _status.firstAct=target;
								var hs=[];
								for(var j=0;j<info.handcards.length;j++){
									hs.push(createCard(info.handcards[j]));
								}
								if(hs.length){
									target.directgain(hs);
								}
								for(var j=0;j<info.equips.length;j++){
									target.$equip(createCard(info.equips[j]));
								}
								for(var j=0;j<info.judges.length;j++){
									target.node.judges.appendChild(createCard(info.judges[j]));
								}
								target=target.next;
							}
						},
						chooseCharacterAi:function(player,list,list2){
							var info=player.brawlinfo;
							if(info.name2!='none'){
								if(info.name=='random'&&info.name2=='random'){
									list=list.slice(0);
									player.init(list.randomRemove(),list.randomRemove());
								}
								else if(info.name=='random'){
									player.init(list.randomGet(),info.name2);
								}
								else if(info.name2=='random'){
									player.init(info.name,list.randomGet());
								}
							}
							else{
								if(info.name=='random'){
									player.init(list.randomGet());
								}
							}
						},
						chooseCharacter:function(list){
							var info=game.me.brawlinfo;
							var event=_status.event;
							if(info.name2=='none'){
								if(info.name!='random'){
									event.chosen=[info.name];
								}
							}
							else{
								if(info.name2=='random'&&info.name=='random'){
									_status.brawl.doubleCharacter=true;
								}
								else if(info.name=='random'){
									game.me.init(info.name2,info.name2);
									game.me.node.avatar.hide();
									game.me.node.name.hide();
									_status.brawl.chooseCharacterStr='选择主将';
									event.modchosen=[info.name,info.name2];
								}
								else if(info.name2=='random'){
									game.me.init(info.name,info.name);
									game.me.node.avatar2.hide();
									game.me.node.name2.hide();
									_status.brawl.chooseCharacterStr='选择副将';
									event.modchosen=[info.name,info.name2];
								}
								else{
									event.chosen=[info.name,info.name2];
								}
							}
							if(game.me.identity=='zhu') return false;
							return 'nozhu';
						},
					}
				},
				showcase:function(init){
					if(init){
						lib.translate.zhu=lib.translate.zhu||'主';
						lib.translate.zhong=lib.translate.zhong||'忠';
						lib.translate.nei=lib.translate.nei||'内';
						lib.translate.fan=lib.translate.fan||'反';


						this.style.transition='all 0s';
						this.style.height=(this.offsetHeight-10)+'px';
						this.style.overflow='scroll';
						lib.setScroll(this);
						var style={marginLeft:'3px',marginRight:'3px'};
						var style2={position:'relative',display:'block',left:0,top:0,marginBottom:'6px',padding:0,width:'100%'};
						var style3={marginLeft:'4px',marginRight:'4px',position:'relative'}


						var scenename=ui.create.node('input',ui.create.div(style2,'','场景名称：',this),{width:'120px'});
						scenename.type='text';
						scenename.style.marginTop='20px';
						var sceneintro=ui.create.node('input',ui.create.div(style2,'','场景描述：',this),{width:'120px'});
						sceneintro.type='text';
						sceneintro.style.marginBottom='10px';

						var line1=ui.create.div(style2,this);
						var addCharacter=ui.create.node('button','添加角色',line1,function(){
							// line1.style.display='none';
							resetStatus();
							editPile.disabled=true;
							// editCode.disabled=true;
							saveButton.disabled=true;
							// exportButton.disabled=true;
							line7.style.display='none';
							line2.style.display='block';
							line2_t.style.display='block';
							line3.style.display='block';
							line4.style.display='block';
							line5.style.display='block';
							line6_h.style.display='block';
							line6_e.style.display='block';
							line6_j.style.display='block';
							capt1.style.display='block';
							capt2.style.display='block';
							if(line6_h.childElementCount) capt_h.style.display='block';
							if(line6_e.childElementCount) capt_e.style.display='block';
							if(line6_j.childElementCount) capt_j.style.display='block';
						},style);
						var editPile=ui.create.node('button','场景选项',line1,function(){
							resetCharacter();
							addCharacter.disabled=true;
							// editCode.disabled=true;
							saveButton.disabled=true;
							// exportButton.disabled=true;
							line7.style.display='none';
							line8.style.display='block';
							capt8.style.display='block';
							line9.style.display='block';
							line10.style.display='block';
							line11.style.display='block';
							capt9.style.display='block';
							line3.style.display='block';

							line6_t.style.display='block';
							line6_b.style.display='block';
							line6_d.style.display='block';
							if(line6_t.childElementCount) capt_t.style.display='block';
							if(line6_b.childElementCount) capt_b.style.display='block';
							if(line6_d.childElementCount) capt_d.style.display='block';
						},style);
						// var editCode=ui.create.node('button','编辑代码',line1,function(){
						//	 console.log(1);
						// },style);
						var saveButton=ui.create.node('button','保存场景',line1,function(){
							if(!scenename.value){
								alert('请填写场景名称');
								return;
							}
							var scene={
								name:scenename.value,
								intro:sceneintro.value,
								players:[],
								cardPileTop:[],
								cardPileBottom:[],
								discardPile:[],
							};
							for(var i=0;i<line7.childElementCount;i++){
								scene.players.push(line7.childNodes[i].info);
							}
							if(scene.players.length<2){
								alert('请添加至少两名角色');
								return;
							}
							if(lib.storage.scene[scenename.value]){
								if(_status.currentScene!=scenename.value){
									if(!confirm('场景名与现有场景重复，是否覆盖？')){
										return;
									}
								}
								game.removeScene(scenename.value);
							}
							for(var i=0;i<line6_t.childElementCount;i++){
								scene.cardPileTop.push(line6_t.childNodes[i].info);
							}
							for(var i=0;i<line6_b.childElementCount;i++){
								scene.cardPileBottom.push(line6_b.childNodes[i].info);
							}
							for(var i=0;i<line6_d.childElementCount;i++){
								scene.discardPile.push(line6_d.childNodes[i].info);
							}
							if(replacepile.checked){
								scene.replacepile=true;
							}
							if(gameDraw.checked){
								scene.gameDraw=true;
							}
							if(turnsresult.value!='none'){
								scene.turns=[parseInt(turns.value),turnsresult.value]
							}
							if(washesresult.value!='none'){
								scene.washes=[parseInt(washes.value),washesresult.value]
							}
							lib.storage.scene[scene.name]=scene;
							game.save('scene',lib.storage.scene);
							game.addScene(scene.name,true);
						},style);


						var capt1=ui.create.div(style2,'','角色信息',this);
						var line2=ui.create.div(style2,this);
						line2.style.display='none';
						var identity=ui.create.selectlist([['zhu','主公'],['zhong','忠臣'],['nei','内奸'],['fan','反贼']],'zhu',line2);
						identity.value='fan';
						identity.style.marginLeft='3px';
						identity.style.marginRight='3px';
						var position=ui.create.selectlist([['0','随机位置'],['1','一号位'],['2','二号位'],['3','三号位'],['4','四号位'],['5','五号位'],['6','六号位'],['7','七号位'],['8','八号位']],'1',line2);
						position.style.marginLeft='3px';
						position.style.marginRight='3px';
						var line2_t=ui.create.div(style2,this);
						line2_t.style.display='none';
						// line2_t.style.marginBottom='10px';
						ui.create.node('span','体力：',line2_t);
						var hp=ui.create.node('input',line2_t,{width:'40px'});
						hp.type='text';
						ui.create.node('span','体力上限：',line2_t,{marginLeft:'10px'});
						var maxHp=ui.create.node('input',line2_t,{width:'40px'});
						maxHp.type='text';
						ui.create.node('span','横置 ',line2_t,{marginLeft:'20px'});
						var linked=ui.create.node('input',line2_t);
						linked.type='checkbox';
						ui.create.node('span','翻面 ',line2_t,{marginLeft:'10px'});
						var turnedover=ui.create.node('input',line2_t);
						turnedover.type='checkbox';
						ui.create.node('span','玩家 ',line2_t,{marginLeft:'10px'});
						var playercontrol=ui.create.node('input',line2_t);
						playercontrol.type='checkbox';

						var list=[];
						for(var i in lib.character){
							list.push([i,lib.translate[i]]);
						}

						list.sort(function(a,b){
							a=a[0];b=b[0];
							var aa=a,bb=b;
							if(aa.indexOf('_')!=-1){
								aa=aa.slice(aa.indexOf('_')+1);
							}
							if(bb.indexOf('_')!=-1){
								bb=bb.slice(bb.indexOf('_')+1);
							}
							if(aa!=bb){
								return aa>bb?1:-1;
							}
							return a>b?1:-1;
						});
						list.unshift(['random','自选主将']);
						var name1=ui.create.selectlist(list,list[0],line2);
						name1.style.marginLeft='3px';
						name1.style.marginRight='3px';
						name1.style.maxWidth='80px';
						list[0][1]='自选副将';
						list.unshift(['none','无副将']);
						var name2=ui.create.selectlist(list,list[0],line2);
						name2.style.marginLeft='3px';
						name2.style.marginRight='3px';
						name2.style.maxWidth='80px';

						var capt9=ui.create.div(style2,'','编辑牌堆',this);
						capt9.style.display='none';


						var capt2=ui.create.div(style2,'','添加卡牌',this);
						var line3=ui.create.div(style2,this);
						line3.style.display='none';
						capt1.style.display='none';
						capt2.style.display='none';

						var line5=ui.create.div(style2,this);
						line5.style.display='none';
						var pileaddlist=[];
						for(var i=0;i<lib.config.cards.length;i++){
							if(!lib.cardPack[lib.config.cards[i]]) continue;
							for(var j=0;j<lib.cardPack[lib.config.cards[i]].length;j++){
								var cname=lib.cardPack[lib.config.cards[i]][j];
								pileaddlist.push([cname,get.translation(cname)]);
								if(cname=='sha'){
									pileaddlist.push(['huosha','火杀']);
									pileaddlist.push(['leisha','雷杀']);
								}
							}
						}
						for(var i in lib.cardPack){
							if(lib.config.all.cards.contains(i)) continue;
							for(var j=0;j<lib.cardPack[i].length;j++){
								var cname=lib.cardPack[i][j];
								pileaddlist.push([cname,get.translation(cname)]);
							}
						}
						pileaddlist.unshift(['random',['随机卡牌']]);
						var cardpileaddname=ui.create.selectlist(pileaddlist,null,line3);
						cardpileaddname.style.marginLeft='3px';
						cardpileaddname.style.marginRight='3px';
						cardpileaddname.style.width='85px';
						var cardpileaddsuit=ui.create.selectlist([
							['random','随机花色'],
							['heart','红桃'],
							['diamond','方片'],
							['club','梅花'],
							['spade','黑桃'],
						],null,line3);
						cardpileaddsuit.style.marginLeft='3px';
						cardpileaddsuit.style.marginRight='3px';
						cardpileaddsuit.style.width='85px';
						var cardpileaddnumber=ui.create.selectlist([
							['random','随机点数'],1,2,3,4,5,6,7,8,9,10,11,12,13
						],null,line3);
						cardpileaddnumber.style.marginLeft='3px';
						cardpileaddnumber.style.marginRight='3px';
						cardpileaddnumber.style.width='85px';

						var fakecard=function(info,position,capt){
							var name=info[0],suit=info[1],number=info[2];
							var card=ui.create.card(null,'noclick',true);
							card.style.zoom=0.6;
							number=parseInt(cardpileaddnumber.value);
							var name2=name;
							var suit2=suit;
							var number2=number;
							if(name2=='random') name2='sha';
							if(suit2=='random') suit2='?';
							if(!number2){
								number='random';
								number2='?';
							}
							card.init([suit2,number2,name2]);
							card.info=info;
							if(name=='random'){
								card.node.name.innerHTML=get.verticalStr('随机卡牌');
							}
							if(position&&capt){
								card.listen(function(){
									this.remove();
									if(!position.childElementCount) capt.style.display='none';
								});
								position.appendChild(card);
							}
							return card;
						};
						var cc_h=ui.create.node('button','加入手牌区',line5,function(){
							fakecard([cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value],line6_h,capt_h);
							capt_h.style.display='block';
						});
						var cc_e=ui.create.node('button','加入装备区',line5,function(){
							if(get.type(cardpileaddname.value)!='equip') return;
							var subtype=get.subtype(cardpileaddname.value);
							for(var i=0;i<line6_e.childElementCount;i++){
								if(get.subtype(line6_e.childNodes[i].name)==subtype){
									line6_e.childNodes[i].remove();break;
								}
							}
							fakecard([cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value],line6_e,capt_e);
							capt_e.style.display='block';
						});
						var cc_j=ui.create.node('button','加入判定区',line5,function(){
							if(get.type(cardpileaddname.value)!='delay') return;
							for(var i=0;i<line6_j.childElementCount;i++){
								if(line6_j.childNodes[i].name==cardpileaddname.value){
									line6_j.childNodes[i].remove();break;
								}
							}
							fakecard([cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value],line6_j,capt_j);
							capt_j.style.display='block';
						});
						cc_h.style.marginLeft='3px';
						cc_h.style.marginRight='3px';
						cc_h.style.width='85px';
						cc_e.style.marginLeft='3px';
						cc_e.style.marginRight='3px';
						cc_e.style.width='85px';
						cc_j.style.marginLeft='3px';
						cc_j.style.marginRight='3px';
						cc_j.style.width='85px';

						var capt_h=ui.create.div(style2,'','手牌区',this);
						var line6_h=ui.create.div(style2,this);
						var capt_e=ui.create.div(style2,'','装备区',this);
						var line6_e=ui.create.div(style2,this);
						var capt_j=ui.create.div(style2,'','判定区',this);
						var line6_j=ui.create.div(style2,this);
						line6_j.style.marginBottom='10px';
						capt_h.style.display='none';
						capt_e.style.display='none';
						capt_j.style.display='none';

						var line10=ui.create.div(style2,this);
						line10.style.display='none';
						var ac_h=ui.create.node('button','加入牌堆顶',line10,function(){
							fakecard([cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value],line6_t,capt_t);
							capt_t.style.display='block';
						});
						var ac_e=ui.create.node('button','加入牌堆底',line10,function(){
							fakecard([cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value],line6_b,capt_b);
							capt_b.style.display='block';
						});
						var ac_j=ui.create.node('button','加入弃牌堆',line10,function(){
							fakecard([cardpileaddname.value,cardpileaddsuit.value,cardpileaddnumber.value],line6_d,capt_d);
							capt_d.style.display='block';
						});
						ac_h.style.marginLeft='3px';
						ac_h.style.marginRight='3px';
						ac_h.style.width='85px';
						ac_e.style.marginLeft='3px';
						ac_e.style.marginRight='3px';
						ac_e.style.width='85px';
						ac_j.style.marginLeft='3px';
						ac_j.style.marginRight='3px';
						ac_j.style.width='85px';

						var line11=ui.create.div(style2,this,'','<span>替换牌堆</span>');
						line11.style.display='none';
						var replacepile=ui.create.node('input',line11);
						replacepile.type='checkbox';

						ui.create.node('span',line11,'开局摸牌',{marginLeft:'10px'});
						var gameDraw=ui.create.node('input',line11);
						gameDraw.type='checkbox';
						gameDraw.checked=true;

						var capt_t=ui.create.div(style2,'','牌堆顶',this);
						var line6_t=ui.create.div(style2,this);
						var capt_b=ui.create.div(style2,'','牌堆底',this);
						var line6_b=ui.create.div(style2,this);
						var capt_d=ui.create.div(style2,'','弃牌堆',this);
						var line6_d=ui.create.div(style2,this);
						line6_d.style.marginBottom='10px';
						capt_t.style.display='none';
						capt_b.style.display='none';
						capt_d.style.display='none';

						var line4=ui.create.div(style2,this);
						line4.style.display='none';
						line4.style.marginTop='20px';
						var resetCharacter=function(){
							// line1.style.display='block';
							editPile.disabled=false;
							// editCode.disabled=false;
							saveButton.disabled=false;
							// exportButton.disabled=false;
							line7.style.display='block';
							line2.style.display='none';
							line2_t.style.display='none';
							line3.style.display='none';
							line4.style.display='none';
							line5.style.display='none';
							line6_h.style.display='none';
							line6_e.style.display='none';
							line6_j.style.display='none';
							capt1.style.display='none';
							capt2.style.display='none';
							capt_h.style.display='none';
							capt_e.style.display='none';
							capt_j.style.display='none';

							name1.value='random';
							name2.value='none';
							identity.value='fan';
							position.value='0';
							hp.value='';
							maxHp.value='';
							line6_h.innerHTML='';
							line6_e.innerHTML='';
							line6_j.innerHTML='';
							cardpileaddname.value='random';
							cardpileaddsuit.value='random';
							cardpileaddnumber.value='random';
							linked.checked=false;
							turnedover.checked=false;
							playercontrol.checked=false;
						};
						var createCharacter=function(info){
							var player=ui.create.player(null,true);
							player._customintro=function(uiintro){
								if(info.handcards.length){
									uiintro.addText('手牌',true);
									var hs=ui.create.div('.buttons');
									for(var i=0;i<info.handcards.length;i++){
										hs.appendChild(fakecard(info.handcards[i]));
									}
									uiintro.add(hs);
								}
								else{
									return false;
								}
							}
							player.info=info;
							var name=info.name,name3=info.name2;
							if(name=='random'){
								name='re_caocao';
							}
							if(name3!='none'){
								if(name3=='random'){
									name3='liubei';
								}
								player.init(name,name3);
								if(info.name2=='random'){
									player.node.name2.innerHTML=get.verticalStr('自选副将');
								}
							}
							else{
								player.init(name);
							}
							if(info.name=='random'){
								player.node.name.innerHTML=get.verticalStr('自选主将');
							}
							if(info.maxHp){
								player.maxHp=info.maxHp;
							}
							if(info.hp){
								player.hp=Math.min(info.hp,player.maxHp);
							}
							for(var i=0;i<info.handcards.length;i++){
								player.node.handcards1.appendChild(ui.create.card());
							}
							for(var i=0;i<info.equips.length;i++){
								player.$equip(fakecard(info.equips[i]));
							}
							for(var i=0;i<info.judges.length;i++){
								player.node.judges.appendChild(fakecard(info.judges[i]));
							}
							player.setIdentity(info.identity);
							var pos=info.position;
							if(pos==0){
								pos='随机位置';
							}
							else{
								pos=get.cnNumber(pos,true)+'号位'
							}
							if(info.linked&&info.turnedover){
								pos+='<br>横置 - 翻面'
							}
							else{
								if(info.linked) pos+=' - 横置';
								if(info.turnedover) pos+=' - 翻面';
							}
							player.setNickname(pos);
							player.update();
							player.style.transform='scale(0.7)';
							player.style.position='relative';
							player.style.left=0;
							player.style.top=0;
							player.style.margin='-18px';
							player.node.marks.remove();


							line7.appendChild(player);
							player.listen(function(){
								if(confirm('是否删除此角色？')){
									this.remove();
									if(line7.childElementCount<8){
										addCharacter.disabled=false;
									}
								}
							});
							if(line7.childElementCount>=8){
								addCharacter.disabled=true;
							}

							return player;
						};
						ui.create.div('.menubutton.large','确定',line4,style3,function(){
							var info={
								name:name1.value,
								name2:name2.value,
								identity:identity.value,
								position:parseInt(position.value),
								hp:parseInt(hp.value),
								maxHp:parseInt(maxHp.value),
								linked:linked.checked,
								turnedover:turnedover.checked,
								playercontrol:playercontrol.checked,
								handcards:[],
								equips:[],
								judges:[]
							};
							for(var i=0;i<line7.childElementCount;i++){
								if(info.identity=='zhu'&&line7.childNodes[i].info.identity=='zhu'){
									alert('不能有两个主公');
									return;
								}
								if(info.position!=0&&info.position==line7.childNodes[i].info.position){
									alert('座位与现在角色相同');
									return;
								}
							}
							for(var i=0;i<line6_h.childElementCount;i++){
								info.handcards.push(line6_h.childNodes[i].info);
							}
							for(var i=0;i<line6_e.childElementCount;i++){
								info.equips.push(line6_e.childNodes[i].info);
							}
							for(var i=0;i<line6_j.childElementCount;i++){
								info.judges.push(line6_j.childNodes[i].info);
							}
							createCharacter(info);
							resetCharacter();
						});
						ui.create.div('.menubutton.large','取消',line4,style3,resetCharacter);
						var line7=ui.create.div(style2,this);
						line7.style.marginTop='12px';


						var capt8=ui.create.div(style2,'','胜负条件',this);
						capt8.style.display='none';
						var line8=ui.create.div(style2,this);
						line8.style.display='none';
						line8.style.marginTop='10px';
						line8.style.marginBottom='10px';
						var turnslist=[['1','一'],['2','两'],['3','三'],['4','四'],['5','五'],['6','六'],['7','七'],['8','八'],['9','九'],['10','十']];
						var results=[['none','无'],['win','胜利'],['lose','失败'],['tie','平局']];
						var turns=ui.create.selectlist(turnslist,'1',line8);
						ui.create.node('span','个回合后',line8,style);
						var turnsresult=ui.create.selectlist(results,'none',line8);


						var washes=ui.create.selectlist(turnslist,'1',line8);
						washes.style.marginLeft='20px';
						ui.create.node('span','次洗牌后',line8,style);
						var washesresult=ui.create.selectlist(results,'none',line8);

						var line9=ui.create.div(style2,this);
						line9.style.display='none';
						line9.style.marginTop='20px';
						var resetStatus=function(all){
							if(line7.childElementCount>=8){
								addCharacter.disabled=true;
							}
							else{
								addCharacter.disabled=false;
							}
							// editCode.disabled=false;
							saveButton.disabled=false;
							// exportButton.disabled=false;
							cardpileaddname.value='random';
							cardpileaddsuit.value='random';
							cardpileaddnumber.value='random';

							line8.style.display='none';
							capt8.style.display='none';
							capt9.style.display='none';
							line9.style.display='none';
							line10.style.display='none';
							line11.style.display='none';
							line3.style.display='none';
							line7.style.display='block';


							line6_t.style.display='none';
							line6_b.style.display='none';
							line6_d.style.display='none';
							capt_t.style.display='none';
							capt_b.style.display='none';
							capt_d.style.display='none';

							if(all===true){
								replacepile.checked=false;
								gameDraw.checked=true;
								turns.value='1';
								turnsresult.value='none';
								washes.value='1';
								washesresult.value='none';
								line6_t.innerHTML='';
								line6_b.innerHTML='';
								line6_d.innerHTML='';
							}
						}

						ui.create.div('.menubutton.large','确定',line9,style3,resetStatus);

						game.addSceneClear=function(){
							resetCharacter();
							resetStatus(true);
							scenename.value='';
							sceneintro.value='';
							line7.innerHTML='';
							delete _status.currentScene;
						};
						game.loadScene=function(scene){
							resetCharacter();
							resetStatus(true);
							scenename.value=scene.name;
							sceneintro.value=scene.intro;
							_status.currentScene=scene.name;
							line7.innerHTML='';
							if(scene.replacepile) replacepile.checked=true;
							if(scene.gameDraw) gameDraw.checked=true;
							else gameDraw.checked=false;
							if(scene.turns){
								turns.value=scene.turns[0].toString();
								turnsresult.value=scene.turns[1];
							}
							if(scene.washes){
								washes.value=scene.washes[0].toString();
								washesresult.value=scene.washes[1];
							}
							for(var i=0;i<scene.cardPileTop.length;i++){
								fakecard(scene.cardPileTop[i],line6_t,capt_t);
							}
							for(var i=0;i<scene.cardPileBottom.length;i++){
								fakecard(scene.cardPileBottom[i],line6_b,capt_b);
							}
							for(var i=0;i<scene.discardPile.length;i++){
								fakecard(scene.discardPile[i],line6_d,capt_d);
							}

							for(var i=0;i<scene.players.length;i++){
								createCharacter(scene.players[i]);
							}
						};
					}
					if(_status.sceneToLoad){
						var scene=_status.sceneToLoad;
						delete _status.sceneToLoad;
						game.loadScene(scene);
					}
				}
			},
			stage:{
				name:'创建关卡',
				content:{
					submode:'normal'
				},
				nostart:true,
				fullshow:true,
				template:{
					showcase:function(init){
						if(init){
							var name=lib.brawl[this.link].name;
							var stage=lib.storage.stage[name];
							var style2={position:'relative',display:'block',left:0,top:0,marginBottom:'10px',padding:0,width:'100%'};
							var style3={marginLeft:'4px',marginRight:'4px',position:'relative'}
							var line1=ui.create.div(style2,this);
							var line2=ui.create.div(style2,this);
							line2.style.lineHeight='50px';
							line2.style.overflow='scroll';
							lib.setScroll(line2);
							var container=this.parentNode.parentNode;
							setTimeout(function(){
								var rect1=container.getBoundingClientRect();
								var rect2=line2.getBoundingClientRect();
								line2.style.height=(rect1.height-(rect2.top-rect1.top))+'px';
							},1000);
							if(_status.extensionmade.contains(name)){
								ui.create.node('button','管理扩展',line1,function(){
									ui.click.configMenu();
									ui.click.extensionTab(name);
								},{marginLeft:'6px'});
							}
							else{
								ui.create.node('button','删除关卡',line1,function(){
									if(confirm('确定删除'+name+'？')){
										game.removeStage(name);
									}
								},{marginLeft:'6px'});
							}
							ui.create.node('button','导出扩展',line1,function(){
								var level=stage.level;
								stage.level=0;
								var str='{name:"'+name+'",content:function(){\nif(lib.config.mode=="brawl"){\n'+
								'if(!lib.storage.stage) lib.storage.stage={};\n'+
								'if(!lib.storage.stage["'+name+'"]){\nlib.storage.stage["'+name+'"]='+get.stringify(stage)+';\n_status.extensionstage=true;}\n'+
								'if(!_status.extensionmade) _status.extensionmade=[];\n'+
								'_status.extensionmade.push("'+name+'");\n}}\n}';
								stage.level=level;
								var extension={'extension.js':'game.import("extension",function(lib,game,ui,get,ai,_status){return '+str+'})'};
								game.importExtension(extension,null,name);
							},{marginLeft:'6px'});
							var noactive=true;
							var clickNode=function(){
								if(this.classList.contains('unselectable')) return;
								if(!this.classList.contains('active')){
									var active=this.parentNode.querySelector('.menubutton.large.active');
									if(active){
										active.classList.remove('active');
									}
									this.classList.add('active');
								}
							}
							for(var i=0;i<stage.scenes.length;i++){
								var node=ui.create.div('.menubutton.large',line2,stage.scenes[i].name,style3,clickNode);
								node.index=i;
								if(stage.mode=='sequal'){
									if(i==stage.level){
										node.classList.add('active');
										noactive=false;
									}
									else{
										node.classList.add('unselectable');
									}
								}
								else if(stage.mode=='normal'){
									if(i>stage.level){
										node.classList.add('unselectable');
									}
								}
								if(lib.storage.lastStage==i&&!node.classList.contains('unselectable')){
									node.classList.add('active');
									noactive=false;
								}
								else if(lib.storage.lastStage==undefined&&noactive&&!node.classList.contains('unselectable')){
									node.classList.add('active');
									noactive=false;
								}
							}
						}
					},
				},
				showcase:function(init){
					if(_status.sceneChanged){
						init=true;
						this.innerHTML='';
						delete _status.sceneChanged;
					}
					if(init){
						this.style.transition='all 0s';
						this.style.height=(this.offsetHeight-10)+'px';
						// this.style.overflow='scroll';
						// lib.setScroll(this);
						var style2={position:'relative',display:'block',left:0,top:0,marginBottom:'6px',padding:0,width:'100%'};
						var style3={marginLeft:'4px',marginRight:'4px',position:'relative'}

						var scenename=ui.create.node('input',ui.create.div(style2,'','关卡名称：',this),{width:'120px'});
						scenename.type='text';
						scenename.style.marginTop='20px';
						var sceneintro=ui.create.node('input',ui.create.div(style2,'','关卡描述：',this),{width:'120px'});
						sceneintro.type='text';
						sceneintro.style.marginBottom='10px';

						var line1=ui.create.div(style2,this);
						var line2=ui.create.div(style2,this);
						line1.style.marginBottom='10px';
						line2.style.lineHeight='50px';
						line2.style.overflow='scroll';
						lib.setScroll(line2);
						var container=this.parentNode.parentNode;
						setTimeout(function(){
							var rect1=container.getBoundingClientRect();
							var rect2=line2.getBoundingClientRect();
							line2.style.height=(rect1.height-(rect2.top-rect1.top))+'px';
						},1000);
						var scenes=[];
						for(var i in lib.storage.scene){
							scenes.push([i,i]);
						}
						if(!scenes.length){
							alert('请创建至少1个场景');
							return;
						}
						var scenelist=ui.create.selectlist(scenes,null,line1);
						var e1=function(){
							if(this.nextSibling){
								this.parentNode.insertBefore(this,this.nextSibling.nextSibling);
							}
						}
						var e2=function(){
							var that=this;
							this.movetimeout=setTimeout(function(){
								e1.call(that);
							},500);
						}
						var e3=function(){
							clearTimeout(this.movetimeout);
							delete this.movetimeout;
						}
						var e4=function(value){
							var node=ui.create.div('.menubutton.large',value,line2,style3,function(){
								if(confirm('是否移除'+this.innerHTML+'？')){
									this.remove();
								}
							});
							if(lib.config.touchscreen){
								node.ontouchstart=e2;
								node.ontouchend=e3;
								node.ontouchmove=e3;
							}
							else{
								node.oncontextmenu=e1;
								node.onmousedown=e2;
								node.onmouseup=e3;
								node.onmouseleave=e3;
							}
						}
						var addButton=ui.create.node('button','添加场景',line1,function(){
							e4(scenelist.value);
						},{marginLeft:'6px',marginRight:'12px'});
						var sceneconfig=ui.create.selectlist([
							['normal','默认模式'],
							['sequal','连续闯关'],
							['free','自由选关']
						],null,line1);
						var saveButton=ui.create.node('button','保存关卡',line1,function(){
							if(!scenename.value){
								alert('请填写关卡名称');
								return;
							}
							if(line2.childElementCount<2){
								alert('请添加至少2个场景');
								return;
							}
							var stage={
								name:scenename.value,
								intro:sceneintro.value,
								scenes:[],
								mode:sceneconfig.value,
								level:0
							};
							for(var i=0;i<line2.childElementCount;i++){
								stage.scenes.push(lib.storage.scene[line2.childNodes[i].innerHTML]);
							}
							if(lib.storage.stage[scenename.value]){
								if(!confirm('关卡名与现有关卡重复，是否覆盖？')){
									return;
								}
								game.removeStage(scenename.value);
							}
							lib.storage.stage[stage.name]=stage;
							game.save('stage',lib.storage.stage);
							game.addStage(stage.name,true);
						},{marginLeft:'6px'});
						game.addStageClear=function(){
							scenelist.value=scenes[0][0];
							sceneconfig.value='normal';
							scenename.value='';
							sceneintro.value='';
							line2.innerHTML='';
						};
					}
				}
			}
		},
	};
});
