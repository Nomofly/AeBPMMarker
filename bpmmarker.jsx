{
    function BPMMarkerCreator(thisObj) {
        var scriptName = "BPM Marker Creator";
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable: true});
        
        function log(message) {
            $.writeln(message);
        }

        // i18n 支持
        var lang = "en"; // 默认语言
        var strings = {
            en: {
                title: "BPM Marker Creator",
                bpm: "BPM:",
                timeSignature: "Time Signature:",
                beat: "Beat:",
                createMarkers: "Create Markers",
                invalidBPM: "Please enter a valid BPM value",
                selectComp: "Please select a composition",
                markersCreated: "BPM markers created, covering the entire timeline",
                error: "An error occurred: ",
                language: "Language:"
            },
            zh: {
                title: "BPM 标记生成器",
                bpm: "BPM:",
                timeSignature: "拍号:",
                beat: "节拍:",
                createMarkers: "创建标记",
                invalidBPM: "请输入有效的 BPM 值",
                selectComp: "请选择一个合成",
                markersCreated: "BPM 标记已创建，覆盖整个时间线",
                error: "发生错误：",
                language: "语言："
            },
            ja: {
                title: "BPM マーカー作成ツール",
                bpm: "BPM:",
                timeSignature: "拍子記号:",
                beat: "ビート:",
                createMarkers: "マーカーを作成",
                invalidBPM: "有効なBPM値を入力してください",
                selectComp: "コンポジションを選択してください",
                markersCreated: "BPMマーカーが作成され、タイムライン全体をカバーしています",
                error: "エラーが発生しました：",
                language: "言語："
            },
            ko: {
                title: "BPM 마커 생성기",
                bpm: "BPM:",
                timeSignature: "박자표:",
                beat: "비트:",
                createMarkers: "마커 생성",
                invalidBPM: "유효한 BPM 값을 입력하세요",
                selectComp: "컴포지션을 선택하세요",
                markersCreated: "BPM 마커가 생성되어 전체 타임라인을 커버합니다",
                error: "오류가 발생했습니다: ",
                language: "언어:"
            },
            de: {
                title: "BPM-Marker-Ersteller",
                bpm: "BPM:",
                timeSignature: "Taktart:",
                beat: "Taktschlag:",
                createMarkers: "Marker erstellen",
                invalidBPM: "Bitte geben Sie einen gültigen BPM-Wert ein",
                selectComp: "Bitte wählen Sie eine Komposition aus",
                markersCreated: "BPM-Marker wurden erstellt und decken die gesamte Zeitleiste ab",
                error: "Ein Fehler ist aufgetreten: ",
                language: "Sprache:"
            }
        };

        function t(key) {
            return strings[lang][key] || strings.en[key] || key;
        }

        // 主面板设置
        myPanel.orientation = "column";
        myPanel.alignChildren = ["fill", "top"];
        myPanel.spacing = 10;
        myPanel.margins = 16;

        // 语言选择
        var langGroup = myPanel.add("group");
        langGroup.orientation = "row";
        langGroup.alignChildren = ["left", "center"];
        langGroup.alignment = ["fill", "top"];
        var langLabel = langGroup.add("statictext", undefined, t("language"));
        var langDropdown = langGroup.add("dropdownlist", undefined, ["English", "中文", "日本語", "한국어", "Deutsch"]);
        langDropdown.selection = 0;
        langDropdown.alignment = ["fill", "center"];

        // 标题
        var titleGroup = myPanel.add("group");
        titleGroup.alignment = ["fill", "top"];
        var title = titleGroup.add("statictext", undefined, t("title"));
        title.alignment = ["center", "center"];
        title.graphics.font = ScriptUI.newFont("Arial", "BOLD", 16);

        // BPM 输入组
        var bpmGroup = myPanel.add("group");
        bpmGroup.orientation = "row";
        bpmGroup.alignChildren = ["left", "center"];
        bpmGroup.alignment = ["fill", "top"];
        var bpmLabel = bpmGroup.add("statictext", undefined, t("bpm"));
        var bpmInput = bpmGroup.add("edittext", undefined, "120");
        bpmInput.alignment = ["fill", "center"];
        bpmInput.characters = 5;

        // 拍号选择组
        var timeSignatureGroup = myPanel.add("group");
        timeSignatureGroup.orientation = "row";
        timeSignatureGroup.alignChildren = ["left", "center"];
        timeSignatureGroup.alignment = ["fill", "top"];
        var timeSignatureLabel = timeSignatureGroup.add("statictext", undefined, t("timeSignature"));
        var timeSignatureDropdown = timeSignatureGroup.add("dropdownlist", undefined, ["4/4", "3/4", "6/8"]);
        timeSignatureDropdown.selection = 0;
        timeSignatureDropdown.alignment = ["fill", "center"];

        // 节拍选择组
        var beatGroup = myPanel.add("group");
        beatGroup.orientation = "row";
        beatGroup.alignChildren = ["left", "center"];
        beatGroup.alignment = ["fill", "top"];
        var beatLabel = beatGroup.add("statictext", undefined, t("beat"));
        var beatDropdown = beatGroup.add("dropdownlist", undefined, ["1/4", "1/8", "1/16"]);
        beatDropdown.selection = 0;
        beatDropdown.alignment = ["fill", "center"];

        // 创建标记按钮
        var confirmButton = myPanel.add("button", undefined, t("createMarkers"));
        confirmButton.alignment = ["fill", "top"];
        confirmButton.onClick = createBPMMarkersWrapper;

        // 版权信息
        var copyrightGroup = myPanel.add("group");
        copyrightGroup.alignment = ["fill", "bottom"];
        var copyrightText = copyrightGroup.add("statictext", undefined, "©️monofly.com");
        copyrightText.alignment = ["center", "center"];
        copyrightText.graphics.font = ScriptUI.newFont("Arial", "REGULAR", 9);
        copyrightText.graphics.foregroundColor = copyrightText.graphics.newPen(copyrightText.graphics.PenType.SOLID_COLOR, [0.5, 0.5, 0.5], 1);

        function updateLanguage() {
            var langMap = {0: "en", 1: "zh", 2: "ja", 3: "ko", 4: "de"};
            lang = langMap[langDropdown.selection.index];
            title.text = t("title");
            bpmLabel.text = t("bpm");
            timeSignatureLabel.text = t("timeSignature");
            beatLabel.text = t("beat");
            confirmButton.text = t("createMarkers");
            langLabel.text = t("language");
            myPanel.layout.layout(true);
        }

        langDropdown.onChange = updateLanguage;

        function createBPMMarkersWrapper() {
            log("Button clicked");
            try {
                var bpm = parseFloat(bpmInput.text);
                var timeSignature = timeSignatureDropdown.selection.text;
                var beat = beatDropdown.selection.text;
                
                log("BPM: " + bpm + ", Time Signature: " + timeSignature + ", Beat: " + beat);

                if (isNaN(bpm) || bpm <= 0) {
                    alert(t("invalidBPM"));
                    return;
                }

                createBPMMarkers(bpm, timeSignature, beat);
            } catch (error) {
                log("Error in button click handler: " + error.toString());
                alert(t("error") + error.toString());
            }
        }

        function createBPMMarkers(bpm, timeSignature, beat) {
            log("Starting to create BPM markers");
            try {
                var comp = app.project.activeItem;
                if (!(comp && comp instanceof CompItem)) {
                    alert(t("selectComp"));
                    return;
                }

                log("Current composition: " + comp.name);

                app.beginUndoGroup("Create BPM Markers");

                // 创建或获取BPM空对象层
                var bpmNull = null;
                for (var i = 1; i <= comp.numLayers; i++) {
                    if (comp.layer(i).name === "BPM") {
                        bpmNull = comp.layer(i);
                        log("Found existing BPM layer");
                        break;
                    }
                }
                if (!bpmNull) {
                    bpmNull = comp.layers.addNull();
                    log("Created new BPM layer");
                }

                // 确保图层名称为"BPM"
                bpmNull.name = "BPM";
                if (bpmNull.source && bpmNull.source instanceof AVLayer) {
                    bpmNull.source.name = "BPM";
                }
                log("Set layer name and source name to: BPM");

                // 检查bpmNull是否正确创建
                if (!bpmNull) {
                    throw new Error("Unable to create or find BPM layer");
                }

                log("BPM layer: " + bpmNull.name);

                // 清除现有的标记
                if (bpmNull.marker && bpmNull.marker.numKeys) {
                    while (bpmNull.marker.numKeys > 0) {
                        bpmNull.marker.removeKey(1);
                    }
                    log("Cleared existing markers");
                } else {
                    log("BPM layer has no existing markers");
                }

                var beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
                var beatValue = parseFloat(beat.split('/')[1]);
                var secondsPerBeat = 60 / bpm;
                var secondsPerMeasure = secondsPerBeat * beatsPerMeasure;

                // 计算需要创建的总拍数
                var totalBeats = Math.ceil(comp.duration / secondsPerBeat);

                for (var i = 0; i < totalBeats; i++) {
                    var beatNumber = (i % beatsPerMeasure) + 1;
                    var markerTime = i * secondsPerBeat;
                    
                    if (!bpmNull.marker) {
                        throw new Error("BPM layer has no marker property");
                    }

                    var newMarker = new MarkerValue(beatNumber.toString());
                    newMarker.comment = beatNumber.toString();
                    
                    if (beatNumber === 1) {
                        newMarker.label = 9; // 青色
                    }

                    bpmNull.marker.setValueAtTime(markerTime, newMarker);
                    log("Added marker " + beatNumber + " at time " + markerTime);
                }

                log("Added " + totalBeats + " markers");

                app.endUndoGroup();

                alert(t("markersCreated"));
                log("BPM marker creation completed");
            } catch (error) {
                log("Error in createBPMMarkers function: " + error.toString());
                alert(t("error") + error.toString());
            }
        }

        // 响应式布局
        myPanel.onResizing = myPanel.onResize = function() {
            this.layout.resize();
        };

        // 设置最小尺寸
        myPanel.minimumSize = [300, myPanel.minimumSize.height];

        // 布局调整
        myPanel.layout.layout(true);
        myPanel.layout.resize();

        return myPanel;
    }

    var myScriptPal = BPMMarkerCreator(this);

    if (myScriptPal != null && myScriptPal instanceof Window) {
        myScriptPal.show();
    }
}