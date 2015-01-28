$(document).ready(function() {
	var self;

	// 어플리케이션 객체 정의
	var app = {
		// 초기화 함수
		init : function () {
			self = this;
			self.makeDropDown();

			// 모든 버튼 disable
			$('div[name=songManager] .btn').addClass('disabled');
		}

		// 이벤트 바인드 처리 함수
		, eventBinding : function () {
			$('#albumList').on('click', 'li', function() {
				if ($(this).hasClass('new')) {
					$('#infoForm .form-control').val('');
					$('#infoArea').hide();
					$('#infoForm').show();

					$('button[name=savAlbum').hide();
					$('button[name=delAlbum').hide();

					self.currentAlbum = {};
					self.deleteSongAll();

					$('div[name=albumManager] .btn').hide();
				} else {
					var idx = $.inArray(this, $('#albumList li'));

					self.currentAlbum = self.dataSource[idx];
					self.renderAlbum();
					self.renderSongList();
					self.btnRelease();

					$('#infoForm').hide();
					$('#infoArea').show();

					$('div[name=albumManager] .btn').show();
				}

				$('.dropdown-toggle span[name=selectedTitle]').text($(this).find('a').text());
			});

			$('#songList tbody').on('click', 'tr', self.selectRow);

			$('button[name=regAlbum]').click(function () {
				self.registAlbum();
				$('#infoForm').hide();
				$('#infoArea').show();
				self.makeDropDown();
				//self.renderAlbum();
				self.selectAlbum();

				return false;
			});

			$('a[name="modAlbum"]').click(function() {
				$('#infoArea').hide();
				$('#infoForm').show();
				$('button[name=regAlbum').hide();
				$('button[name=savAlbum').show();
				$('button[name=delAlbum').show();

				var album = self.currentAlbum.album;

				$('input[name=albumTitle]').val(album.title);
				$('input[name=albumArtist]').val(album.artist);
				$('input[name=albumImg]').val(album.img);
				$('input[name=albumGenre]').val(album.genre);
				$('input[name=albumInfo]').val(album.info);
				$('input[name=albumPublish]').val(album.publish);
			});

			$('button[name=savAlbum').click(function() {
				self.updateAlbum();
				$('#infoArea').hide();
				$('#infoForm').show();
				self.renderAlbum();
			});

			$('button[name=delAlbum').click(function() {

			});

			$('a[name=addSong]').click(function() {
				$('#songList tbody').append(self.addFormRow());
				$('.btn[name=savSong]').removeClass('disabled');
			});

			$('a.btn[name=modSong]').click(function() {
				$('#songList tbody tr.info:not(".formRow")').each(function(idx, row) {
					self.editRow(row);
					$('a.btn[name=savSong]').removeClass('disabled');
				});
			});

			$('a.btn[name=savSong]').click(self.saveRows);

			$('a.btn[name=delSong]').click(function() {
				_.each($('#songList tbody tr.info'), self.deleteRow);
			});

			$('#songList tbody').on('click', '.formRow', function() {
				$('a.btn[name=delSong]').removeClass('disabled');
				self.currentFormRow = this;
			});
		}

		, makeDropDown : function() {
			$('#albumList').html('');
			self.dataSource = dataSource;

			// 앨범 DropDown 구성
			_.each(self.dataSource, function(obj) {
				self.addAlbum(obj.album);
			});

			var newAlbumHtml = '<li class="divider"></li>\n' +
												 '<li class="new"><a href="#">새로운 앨범 등록</a></li>';
			$('#albumList').append(newAlbumHtml);
		}

		// DropDown에 앨범정보를 생성하는 함수
		, addAlbum : function (album) {
			$('<li/>').wrapInner('<a>'+album.title+'</a>').appendTo('#albumList');
		}

		, updateAlbum : function () {
			self.currentAlbum.album.title 	= $('input[name=albumTitle]').val();
			self.currentAlbum.album.artist 	= $('input[name=albumArtist]').val();
			self.currentAlbum.album.img 		= $('input[name=albumImg]').val();
			self.currentAlbum.album.genre 	= $('input[name=albumGenre]').val();
			self.currentAlbum.album.info 		= $('input[name=albumInfo]').val();
			self.currentAlbum.album.publish = $('input[name=albumPublish]').val();
		}

		, deleteAlbum : function (album) {

		}

		, selectAlbum : function(no) {
			
		}

		// 모든 버튼의 disable을 해제한다.
		, btnRelease : function() {
			$('a.btn').removeClass('disabled');

			$('a.btn[name=modSong]').addClass('disabled');
			$('a.btn[name=savSong]').addClass('disabled');
			$('a.btn[name=delSong]').addClass('disabled');
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

		, registAlbum : function() {
			self.currentAlbum.title 	= $('input[name=albumTitle]').val();
			self.currentAlbum.artist 	= $('input[name=albumArtist]').val();
			self.currentAlbum.img			= $('input[name=albumImg]').val();
			self.currentAlbum.genre		= $('input[name=albumGenre]').val();
			self.currentAlbum.info 		= $('input[name=albumInfo]').val();
			self.currentAlbum.publish	=	$('input[name=albumPublish]').val();

			self.saveAlbum(self.currentAlbum);
		}

		, saveAlbum : function(album) {
			var obj = {};
			obj._id = _.now();
			obj.album = self.currentAlbum;
			self.dataSource.push(obj);
		}

		// 노래 목록을 생성하는 함수
		, renderSongList : function() {
			var album = self.currentAlbum.album;
			var list 	= self.currentAlbum.songs;
		
			$('#albumTitle').text(album.artist + ' - ' + album.title);
			$('#songList tbody').html('');

			_.each(list, self.renderRow);
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
			$(this).toggleClass('info');

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
				song.no 			= $(row).find('input[name=songNo]').val();
				song.title 		= $(row).find('input[name=songTitle]').val();
				song.playTime = $(row).find('input[name=songPlayTime]').val();
				song.artist 	= $(row).find('input[name=songArtist]').val();
			} else {
				song.no 			= $(row).find('td').eq(0).text();
				song.title 		= $(row).find('td').eq(1).text();
				song.playTime = $(row).find('td').eq(2).text();
				song.artist 	= $(row).find('td').eq(3).text();
			}
			return song;
		} 

		// 선택된 row를 수정할 수 있도록 폼 형태로 변환하는 함수
		, editRow : function (row) {
			var song = self.getDataFromRow(row);
			$(row).after(self.addFormRow(song));
			$(row).remove();
		}

		// 신규 입력한 노래 정보를 저장하는 함수
		, saveRows : function() {
			$('#songList tr.formRow').each(function (n, row) {
				var song = self.getDataFromRow(row);

				if ($(row).hasClass('newSong')) {
					self.insertSong(song);
				} else {
					var idx = $.inArray(row, $('#songList tbody tr'));
					self.updateSong(idx, song);
					$(row).removeClass('newSong');
				}
			});
			$('a.btn[name=savSong]').addClass('disabled');
			self.currentAlbum.songs = _.sortBy(self.currentAlbum.songs, function(obj) { return obj.no; });
			self.renderSongList();
		}

		// 새로운 노래 정보를 저장하는 함수
		, insertSong : function (song) {
			self.currentAlbum.songs.push(song);
		}

		// 수정한 노래 정보를 저장하는 함수
		, updateSong : function (idx, song) {
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
