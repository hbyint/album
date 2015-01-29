$(document).ready(function() {
	var self;

	// 어플리케이션 객체 정의
	var app = {
		// 초기화 함수
		init : function () {
			self = this;
			self.currentIdx = dataSource.length + 1;
			self.makeDropDown();

			// 노래 목록 버튼 disable
			$('div[name=songManager] .btn').addClass('disabled');

			// 앨범 이동 버튼 disable
			$('a[name=prevAlbum], a[name=nextAlbum]').addClass('disabled');

			self.checkNavBtn();
		}

		// 이벤트 바인드 처리 함수
		, eventBinding : function () {

			// 드롭다운 목록에서 특정 앨범을 클릭했을 때 처리
			$('#albumList').on('click', 'li', function(e) {
				e.preventDefault();

				// 앨범정보를 표시할 것인지 새로운 앨범을 등록할 것인지 구분
				// '새로운 앨범 등록' 은 'new' class를 가지고 있음
				// 클릭한 LI 엘리먼트가 new 클래스를 가지고 있는지 판단하여 분기 처리
				if ($(this).hasClass('new')) {
					$('#infoForm .form-control').val('');	// input 엘리먼트 값 초기화

					$('#infoArea').hide();					// 앨범 정보 표시 영역 감추기
					$('#infoForm').show();					// 앨범 입력 폼 표시	
					$('div[name=albumManager] .btn').hide();

					self.deleteSongAll();					// 오른쪽 노래목록 초기화
				} else {
					var idx = $.inArray(this, $('#albumList li'));	// 현재 클릭한 엘리먼트가 드롭다운 목록중 몇번째 엘리먼트인지 구함

					self.selectAlbum(idx);							// 해당 순번의 앨범을 선택
				}

				self.changeDropDown($(this).find('a').text());		// 드롭다운의 표시명을 클릭한 엘리먼트의 앨범명으로 변경함
			});

			// 앨범 등록 버튼 처리
			$('button[name=regAlbum]').click(function (e) {
				self.registAlbum();

				$('#infoForm').hide();
				$('#infoArea').show();
				self.makeDropDown();
				
				var idx = dataSource.length - 1;			// 맨 뒤에 추가하므로 마지막 앨범을 선택함
				self.selectAlbum(idx);

				self.changeDropDown(self.currentAlbum.album.title);

				return false;								// 이벤트 버블링 방지
			});

			// 앨범 수정 버튼 처리
			$('a[name="modAlbum"]').click(function(e) {
				e.preventDefault();

				// 폼과 버튼 처리
				$('#infoArea').hide();
				$('#infoForm').show();
				$('button[name=regAlbum]').hide();
				$('button[name=savAlbum]').show();

				// 현재 앨범에서 값을 가져와서 폼에 셋팅함
				var album = self.currentAlbum.album;

				$('input[name=albumTitle]').val(album.title);
				$('input[name=albumArtist]').val(album.artist);
				$('input[name=albumImg]').val(album.img);
				$('input[name=albumGenre]').val(album.genre);
				$('input[name=albumInfo]').val(album.info);
				$('input[name=albumPublish]').val(album.publish);
			});

			// 앨범 저장 버튼 처리
			$('button[name=savAlbum]').click(function(e) {
				self.updateAlbum();

				// 앨범 저장 후 앨범 정보를 표시함
				$('#infoForm').hide();
				$('#infoArea').show();
				self.selectAlbum();
				return false;
			});

			// 앨범 삭제 버튼 처리
			$('a[name=delAlbum]').click(function() {
				self.deleteAlbum(self.currentAlbum);

				// 현재 앨범 삭제 후 앨범 정보 및 화면 초기화
				self.currentAlbum = {};
				$('#infoForm').hide();
				$('#infoArea').show();
				self.selectAlbum(dataSource.length+1);

				return false;
			});

			// 이전 앨범으로 이동
			$('a[name=prevAlbum]').click(function() {
				self.prevAlbum();
				return false;
			});

			// 다음 앨범으로 이동
			$('a[name=nextAlbum]').click(function() {
				self.nextAlbum();
				return false;
			})

			// 노래 목록에서 클릭했을 때 선택 상태를 토글
			$('#songList tbody').on('click', 'tr', self.selectRow);

			// 노래 추가 버튼 처리
			$('a[name=addSong]').click(function() {
				$('#songList tbody').append(self.addFormRow());			// 테이블의 맨 뒤에 폼 row를 추가
				$('.btn[name=savSong]').removeClass('disabled');		// 저장 버튼 활성화
				return false;
			});

			// 노래 수정 버튼 처리
			$('a.btn[name=modSong]').click(function() {

				// 선택된 row 들을 폼 row로 변경하고 저장 버튼 활성화
				$('#songList tbody tr.info:not(".formRow")').each(function(idx, row) {
					self.editRow(row);
					$('a.btn[name=savSong]').removeClass('disabled');
				});
				return false;
			});

			// 노래 저장 버튼 처리
			$('a.btn[name=savSong]').click(function() {
				self.saveRows();
				return false;
			});

			// 노래 삭제 버튼 처리
			$('a.btn[name=delSong]').click(function() {
				_.each($('#songList tbody tr.info'), self.deleteRow);
				return false;
			});

			// form row를 클릭하면 삭제 버튼 활성화 처리
			$('#songList tbody').on('click', '.formRow', function() {
				$('a.btn[name=delSong]').removeClass('disabled');
				return false;
			});
		}

		// 모든 버튼의 disable을 해제한다.
		, btnRelease : function() {
			$('a.btn').removeClass('disabled');

			$('a.btn[name=modSong]').addClass('disabled');
			$('a.btn[name=savSong]').addClass('disabled');
			$('a.btn[name=delSong]').addClass('disabled');
		}

		// 드롭다운 목록 생성
		, makeDropDown : function() {
			$('#albumList').html('');		// 드롭다운의 목록을 초기화 함
			self.dataSource = dataSource;	// 전역 daSource를 app 객체 변수로 할당

			// 앨범 DropDown 구성
			// dataSource를 순환하면서 목록에 앨범 추가
			_.each(self.dataSource, function(obj) {
				self.addAlbum(obj.album);
			});

			// 드롭다운 목록이 초기화 되었으므로 '새로운 앨범 등록' 항목 다시 추가
			var newAlbumHtml = '<li class="divider"></li>\n' +
												 '<li class="new"><a href="#">새로운 앨범 등록</a></li>';
			$('#albumList').append(newAlbumHtml);
		}

		// 드롭다운에 선택된 앨범 표시를 변경
		, changeDropDown : function(title) {
			$('.dropdown-toggle span[name=selectedTitle]').text(title);
		}

		// DropDown에 앨범정보를 생성하는 함수
		, addAlbum : function (album) {
			$('<li/>').wrapInner('<a>'+album.title+'</a>').appendTo('#albumList');
		}

		// 신규 앨범을 등록
		, registAlbum : function() {

			// 폼 정보를 현재 앨범에 저장하고 현재 앨범을 저장
			self.currentAlbum = {};				// 객체 초기화	
			self.currentAlbum.album = {};		// 객체 초기화
			self.currentAlbum.album.title 	= $('input[name=albumTitle]').val();
			self.currentAlbum.album.artist 	= $('input[name=albumArtist]').val();
			self.currentAlbum.album.img		= $('input[name=albumImg]').val();
			self.currentAlbum.album.genre	= $('input[name=albumGenre]').val();
			self.currentAlbum.album.info 	= $('input[name=albumInfo]').val();
			self.currentAlbum.album.publish	= $('input[name=albumPublish]').val();

			self.saveAlbum();
		}

		// 앨범 정보 업데이트
		, updateAlbum : function () {
			self.currentAlbum.album.title 	= $('input[name=albumTitle]').val();
			self.currentAlbum.album.artist 	= $('input[name=albumArtist]').val();
			self.currentAlbum.album.img		= $('input[name=albumImg]').val();
			self.currentAlbum.album.genre 	= $('input[name=albumGenre]').val();
			self.currentAlbum.album.info	= $('input[name=albumInfo]').val();
			self.currentAlbum.album.publish	= $('input[name=albumPublish]').val();
		}

		// 신규 앨범 정보를 저장 
		, saveAlbum : function() {
			var obj = {};
			obj._id = _.now();
			obj.album = self.currentAlbum.album;
			self.dataSource.push(obj);
		}

		// dataSource에 있는 앨범 삭제
		, deleteAlbum : function (album) {
			dataSource = _.reject(dataSource, function(obj) { return obj._id == album._id; });
		}

		// 특정 앨범을 선택한 이후 처리
		, selectAlbum : function(no) {
			self.currentIdx = no;			// 현재 앨범의 dataSouce에서 몇번째인지 저장
			
			//앨범 정보 영역 처리
			if (no < dataSource.length) {	// 번호가 dataSource 길이 이내라면 앨범 정보 렌더링 처리
				self.currentAlbum = self.dataSource[no];
				self.renderAlbum();

				$('#infoForm').hide();
				$('#infoArea').show();

				$('div[name=albumManager] .btn').show();
				self.changeDropDown(self.currentAlbum.album.title);
			} else {						// 번호가 dataSource 길이보다 크다면 초기화
				self.changeDropDown('앨범 선택...');
				$('#albumInfo').html('');
			}

			self.renderSongList();			// 노래 목록 처리
			self.btnRelease();
			self.checkNavBtn();
		}

		// 앨범을 선택했을때 앨범정보 화면을 생성하는 함수
		, renderAlbum : function () {
			var album = self.currentAlbum.album;
			var html = '<img src="' + album.img + '">\n' +
					       '  <div class="caption">\n' +
					       '  <p style="font-size: 16px;"><strong>아티스트</strong> <span>' + album.artist +'</span></p>' +
					       '  <p style="font-size: 16px;"><strong>앨범정보</strong> <span>' + album.info + '</span></p>' +
					       '  <p style="font-size: 16px;"><strong>장르</strong> <span>' + album.genre +'</span></p>' +
					       '  <p style="font-size: 16px;"><strong>발매일</strong> <span>' + album.publish + '</span></p>' +
					       '</div>';

			$('#albumInfo').html(html);
		}

		// 이전 앨범으로 이동
		, prevAlbum : function() {
			self.selectAlbum(self.currentIdx-1);
		}

		// 다음 앨범으로 이동
		, nextAlbum : function(idx) {
			self.selectAlbum(self.currentIdx+1);
		}

		// 이전/다음 버튼의 활성화/비활성화 처리
		, checkNavBtn : function() {
			var len = dataSource.length;
			
			if (self.currentIdx == 0) {
				$('a[name=prevAlbum]').addClass('disabled');
			}

			if (self.currentIdx == len - 1) {
				$('a[name=nextAlbum]').addClass('disabled');
			}

			if (self.currentIdx > 0 && self.currentIdx < len - 1) {
				$('a[name=prevAlbum], a[name=nextAlbum]').removeClass('disabled');
			}
		}

		// 노래 목록을 생성하는 함수
		, renderSongList : function() {
			var album = self.currentAlbum.album;
			var list 	= self.currentAlbum.songs;
			
			$('#songList tbody').html('');

			if (typeof album === 'undefined') {			// 앨범 정보가 비어있으면 목록 초기화
				$('#albumTitle').text('');
				$('#songList tbody').html('');
			} else {
				$('#albumTitle').text(album.artist + ' - ' + album.title);
				_.each(list, self.renderRow);
			}		
		} 

		// 노래목록의 한 줄을 생성하는 함수
		, renderRow : function (song) {
			var html = '<tr>\n' +
								 '	<td class="text-center">' + song.no + '</td>\n' +
								 '	<td>' + song.title + '</td>\n' +
								 '	<td class="text-center">' + song.playTime + '</td>\n' +
								 '	<td>' + song.artist + '</song>\n' +
								 '</tr>';
			$('#songList tbody').append(html);
		}

		// 노래 목록을 클릭했을 때 선택 상태를 토글시키는 함수
		, selectRow : function(e) {
			$(this).toggleClass('info');			// 노래 선택 상태 토글

			// 버튼 활성화/비활성화 처리
			if ($('#songList .info').length > 0) {
				$('a.btn[name=modSong]').removeClass('disabled');
				$('a.btn[name=delSong]').removeClass('disabled');
			} else {
				$('a.btn[name=modSong]').addClass('disabled');
				$('a.btn[name=delSong]').addClass('disabled');
			}
		}

		// 새로운 노래를 등록하기 위해 폼 row를 생성하는 함수
		, addFormRow : function (song) {
			var isNew = '';

			// 노래정보가 비어 있다면 (신규) 빈 객체 생성
			if (typeof song === 'undefined') {
				song = {};
				song.no = ($('#songList tbody tr').length + 1);
				song.title = '';
				song.playTime = '';
				song.artist = '';
				isNew = 'newSong';
			}

			$('#songList tbody tr.info').removeClass('info');

			var html = '<tr class="formRow ' + isNew + '">\n' +
								 '	<td class="text-center"><input type="text" class="form-control text-center" name="songNo" value="' + song.no + '"></td>\n' +
								 '	<td><input type="text" class="form-control" name="songTitle" placeholder="노래 이름을 입력하세요." value="' + song.title + '"></td>\n' +
								 '	<td class="text-center"><input type="text" class="form-control text-center" name="songPlayTime" placeholder="00:00" value="' + song.playTime + '"></td>\n' +
								 '	<td><input type="text" class="form-control" name="songArtist" placeholder="아티스트명" value="' + song.artist + '"></song>\n' +
								 '</tr>';
			return html;
		}

		// 폼 row에서 데이터를 추출하는 함수
		, getDataFromRow : function(row) {
			var song = {};

			if ($(row).hasClass('formRow')) {
				song.no 		= $(row).find('input[name=songNo]').val();
				song.title 		= $(row).find('input[name=songTitle]').val();
				song.playTime 	= $(row).find('input[name=songPlayTime]').val();
				song.artist 	= $(row).find('input[name=songArtist]').val();
			} else {
				song.no 		= $(row).find('td').eq(0).text();
				song.title 		= $(row).find('td').eq(1).text();
				song.playTime 	= $(row).find('td').eq(2).text();
				song.artist 	= $(row).find('td').eq(3).text();
			}

			return song;
		} 

		// 선택된 row를 수정할 수 있도록 폼 형태로 변환하는 함수
		, editRow : function (row) {
			var song = self.getDataFromRow(row);		// 선택된 row에서 노래 정보를 추출하고
			$(row).after(self.addFormRow(song));		// form row를 생성한 후
			$(row).remove();							// 기존 row를 제거
		}

		// 신규 입력한 노래 정보를 저장하는 함수
		, saveRows : function() {
			$('#songList tr.formRow').each(function (n, row) {
				var song = self.getDataFromRow(row);
				if ($(row).hasClass('newSong')) {		// 추가일 때
					self.currentAlbum.songs = [];
					self.insertSong(song);
					$(row).removeClass('newSong');
				} else {								// 수정일 때
					var idx = $.inArray(row, $('#songList tbody tr'));
					self.updateSong(idx, song);
					$(row).removeClass('newSong');
				}
			});

			$('a.btn[name=savSong]').addClass('disabled');

			// 목록을 다시 랜더링 하기 전에 순번대로 정렬
			self.currentAlbum.songs = _.sortBy(self.currentAlbum.songs, function(obj) { return obj.no; });
			self.renderSongList();
		}

		// 새로운 노래 정보를 저장하는 함수
		, insertSong : function (song) {
			self.currentAlbum.songs.push(song);
		}

		// 수정한 노래 정보를 저장하는 함수
		, updateSong : function (idx, song) {

			// 특정 위치에 객체를 삽입하기 위해 배열을 둘로 쪼갠 후
			// 해당 위치의 객체를 제거하고 새로운 객체를 추가하고
			// 배열을 다시 합침
			var arr1 = self.currentAlbum.songs.slice(0, idx+1);
			var arr2 = self.currentAlbum.songs.slice(idx+1);
			
			arr1.pop(idx);
			arr1.push(song);

			self.currentAlbum.songs = arr1.concat(arr2);
		}

		// 선택한 노래 목록을 삭제하는 함수
		, deleteRow : function($row) {
			$row.remove();
			var idx = $.inArray($row[0], $('#songList tbody tr')); 
			self.currentAlbum.songs.pop(idx);
		}

		// 노래 목록을 지우고 초기화
		, deleteSongAll : function() {
			$('#songList tbody').html('');
			$('#albumTitle').text('');
		}
	};

	// 어플맄케이션을 초기화 한다.
	app.init();

	// 이벤트 바인딩을 처리한다.
	app.eventBinding();
});
