import { Component, ElementRef, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { APP_User_Data, New_Work_Items } from '../../../core/app-constant-data';

@Component({
    standalone: false,
    selector: 'app-work-item-create',
    templateUrl: './work-item-create.component.html',
    styleUrls: ['./work-item-create.component.css']
})
export class WorkItemCreateComponent {
    model: any = {
        title: '',
        assignedTo: '',
        assignedRole: '',
        state: 'New',
        tags: '',
        description: '',
        reason: '',
        area: '',
        iterationPath: '',
        details: '',
        history: '',
        linkedItems: [],
        attachments: [],
        storyPoint: null,
        priority: 'Medium',
        risk: 'Medium',
        actualStart: '',
        actualEnd: '',
        planStart: '',
        planEnd: '',
        acceptanceCriteria: '',
        designApproach: '',
        impactAnalysis: '',
        impactedArea: '',
        discussion: '',
        discussions: []
    };
    // git/pr model
    modelGitTemplate = {
        sourceBranch: '',
        targetBranch: 'main',
        prTitle: '',
        prDescription: '',
        commits: [],
        approvalsRequired: 1,
        pr: null
    };
   

    stateOptions = [
        { name: 'New', color: '#0ea5e9' },
        { name: 'Active', color: '#f59e0b' },
        { name: 'Resolved', color: '#10b981' },
        { name: 'Closed', color: '#6b7280' }
    ];

    // classic state color map (canonicalized)
    stateColorMap: Record<string,string> = {
        'New':'#0ea5e9',
        'Active':'#f59e0b',
        'In Progress':'#f97316',
        'Resolved':'#10b981',
        'Closed':'#6b7280',
        'Blocked':'#ef4444'
    };

    getStateColor(stateName: string) {
        if (!stateName) return '#6b7280';
        const n = String(stateName).trim();
        return this.stateColorMap[n] || (this.stateOptions.find((x) => x.name === n)?.color) || '#6b7280';
    }

    // Assignee popup
    @ViewChild('assigneeWrapper', { static: false }) assigneeWrapper?: ElementRef;
    @ViewChild('wicCard', { static: false }) wicCard?: ElementRef;
    @ViewChild('discussionArea', { static: false }) discussionArea?: ElementRef<HTMLElement>;
    showAssigneeList = false;
    showLinkedPanel = false;
    showHistoryPanel = false;
    showAttachmentsPanel = false;
    activeTab: 'details' | 'linked' | 'history' | 'attachments' | 'git' = 'details';
    // mention support in Discussion
    showMentionList = false;
    mentionCandidates: any[] = [];
    mentionFilter = '';
    mentionFocusedIndex = -1;
    private mentionStartIndex = -1;
    private mentionRange: any = null;
    filterTerm = '';
    private filter$ = new Subject<string>();
    private filterSub?: Subscription;
    focusedAssigneeIndex = -1;
    users: any[] = [];
    workItemTypes: any[] = [];
    selectedLinkedType: any = null;

    constructor() {
        // clone app users and ensure Abhi Singh exists as default
        this.users = APP_User_Data ? APP_User_Data.slice() : [];
        const defaultUser = { Id: 0, Name: 'Abhi Singh', Email: 'abhi.singh@example.com', Designation: 'Solution Architect', Department: 'Development', Role: 'SA', Status: 'Active' };
        if (!this.users.find(u => u.Name === defaultUser.Name)) {
            this.users.unshift(defaultUser);
        }
        // previousModel to track changes
        this.previousModel = { ...this.model };
        this.historyEntries = [];

        // initialize git model container
        if (!this.model.git) {
            this.model.git = { ...this.modelGitTemplate };
        }

        // debounced filter subscription
        this.filterSub = this.filter$.pipe(debounceTime(200)).subscribe(term => {
            this.filterTerm = term;
        });
        // available work item types
        this.workItemTypes = (New_Work_Items || []).slice();
        if (this.workItemTypes.length) {
            this.selectedLinkedType = this.workItemTypes[0];
            if (!this.model.type) this.model.type = this.workItemTypes[0].Name;
        }

        // type colors (classic mapping)
        this.typeColorMap = {
            'Bug':'#ef4444','ChangeRequest':'#f97316','Epic':'#8b5cf6','Feature':'#3b82f6','Issue':'#fb7185','Observation':'#f59e0b','Risk':'#f43f5e','Subtask':'#06b6d4','Task':'#10b981','Test':'#6366f1','TestCase':'#7c3aed','UserStory':'#0ea5a4','User Story':'#0ea5a4'
        };
    }

    ngOnDestroy(): void {
        this.filterSub?.unsubscribe();
    }

    previousModel: any = {};
    historyEntries: any[] = [];
    planDateError = false;
    planDateErrorMsg = '';
    actualDateError = false;
    actualDateErrorMsg = '';

    onFieldChange(field: string, newVal: any) {
        const oldVal = this.previousModel ? this.previousModel[field] : undefined;
        if (oldVal === undefined && !(field in this.previousModel)) {
            this.previousModel[field] = newVal;
            return;
        }
        // normalize to string for comparison
        const oldS = oldVal === null || oldVal === undefined ? '' : String(oldVal);
        const newS = newVal === null || newVal === undefined ? '' : String(newVal);
        if (oldS !== newS) {
            const entry = { ts: new Date(), user: 'You', field, oldValue: oldS, newValue: newS };
            this.historyEntries.unshift(entry);
            this.previousModel[field] = newVal;
        }
    }

    formatDate(d: any) {
        const dt = new Date(d);
        return dt.toLocaleString();
    }

    // date-picker handlers
    onPlanStartChange(e: any) {
        const dateStr = e && e.dateStr ? e.dateStr : '';
        this.model.planStart = dateStr;
        this.onFieldChange('planStart', dateStr);
        this.validatePlanDates();
    }

    onPlanEndChange(e: any) {
        const dateStr = e && e.dateStr ? e.dateStr : '';
        this.model.planEnd = dateStr;
        this.onFieldChange('planEnd', dateStr);
        this.validatePlanDates();
    }

    onActualStartChange(e: any) {
        const dateStr = e && e.dateStr ? e.dateStr : '';
        this.model.actualStart = dateStr;
        this.onFieldChange('actualStart', dateStr);
        this.validateActualDates();
    }

    onActualEndChange(e: any) {
        const dateStr = e && e.dateStr ? e.dateStr : '';
        this.model.actualEnd = dateStr;
        this.onFieldChange('actualEnd', dateStr);
        this.validateActualDates();
    }

    validatePlanDates() {
        this.planDateError = false;
        this.planDateErrorMsg = '';
        if (this.model.planStart && this.model.planEnd) {
            const s = new Date(this.model.planStart);
            const e = new Date(this.model.planEnd);
            if (isNaN(s.getTime()) || isNaN(e.getTime())) return;
            if (e < s) {
                this.planDateError = true;
                this.planDateErrorMsg = 'Planning End must be the same or after Planning Start.';
            }
        }
    }

    validateActualDates() {
        this.actualDateError = false;
        this.actualDateErrorMsg = '';
        if (this.model.actualStart && this.model.actualEnd) {
            const s = new Date(this.model.actualStart);
            const e = new Date(this.model.actualEnd);
            if (isNaN(s.getTime()) || isNaN(e.getTime())) return;
            if (e < s) {
                this.actualDateError = true;
                this.actualDateErrorMsg = 'Actual End must be the same or after Actual Start.';
            }
        }
    }

    hasErrors() {
        return this.planDateError || this.actualDateError;
    }

    get filteredUsers() {
        const term = (this.filterTerm ||  '').toLowerCase();
        return this.users.filter(u => (u.Name + ' ' + (u.Email || '')).toLowerCase().includes(term));
    }

    openAssigneeList() {
        this.showAssigneeList = true;
        this.filterTerm =  '';
        this.focusedAssigneeIndex = -1;
    }

    selectUser(u: any) {
        const prev = this.model.assignedTo;
        this.model.assignedTo = u.Name;
        this.model.assignedRole = u.Role || '';
        this.showAssigneeList = false;
        this.onFieldChange('assignedTo', this.model.assignedTo);
    }

    onAssigneeInputKeydown(event: KeyboardEvent) {
        const list = this.filteredUsers;
        if (!this.showAssigneeList || !list || list.length === 0) return;
        if (event.key === 'ArrowDown') {
            this.focusedAssigneeIndex = Math.min(this.focusedAssigneeIndex + 1, list.length - 1);
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            this.focusedAssigneeIndex = Math.max(this.focusedAssigneeIndex - 1, 0);
            event.preventDefault();
        } else if (event.key === 'Enter') {
            if (this.focusedAssigneeIndex >= 0 && this.focusedAssigneeIndex < list.length) {
                this.selectUser(list[this.focusedAssigneeIndex]);
                event.preventDefault();
            }
        } else if (event.key === 'Escape') {
            this.showAssigneeList = false;
        }
    }

    onAssigneeFilterChange(val: string) {
        this.filter$.next(val || '');
    }

    trackByUser(index: number, item: any) { return item && (item.Id || item.Email || item.Name) || index; }
    trackByLinked(index: number, item: any) { return (item && (item.type?.Name || item.typeName || item.value || JSON.stringify(item))) + '_' + index; }
    trackByAttachment(index: number, item: any) { return item.name + '_' + index; }
    trackByHistory(index: number, item: any) { return item.ts ? item.ts.toString() + '_' + index : index; }

    // Linked items
    addLinkedItem(value: string, type?: any) {
        if (!value) return;
        const trimmed = value.trim();
        if (!trimmed) return;
        if (!this.model.linkedItems) this.model.linkedItems = [];
        const li = { type: type || null, typeName: type ? (type.Name || type.name) : '', value: trimmed };
        this.model.linkedItems.push(li);
        this.historyEntries.unshift({ ts: new Date(), user: 'You', field: 'linkedItems', oldValue: '', newValue: `${li.typeName}: ${trimmed}` });
    }

    removeLinkedItem(idx: number) {
        if (!this.model.linkedItems) return;
        this.model.linkedItems.splice(idx, 1);
    }

    // Attachments
    onFilesSelected(event: any) {
        const files: FileList = event.target.files;
        if (!files || files.length === 0) return;
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            this.model.attachments.push({ name: f.name, size: f.size });
            this.historyEntries.unshift({ ts: new Date(), user: 'You', field: 'attachments', oldValue: '', newValue: f.name });
        }
        // clear input
        event.target.value = '';
    }

    removeAttachment(idx: number) {
        if (!this.model.attachments) return;
        const removed = this.model.attachments.splice(idx, 1);
        if (removed && removed.length) {
            this.historyEntries.unshift({ ts: new Date(), user: 'You', field: 'attachments', oldValue: removed[0].name, newValue: '' });
        }
    }

    getInitials(name: string) {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    getUserColor(u: any) {
        // honor explicit user color if present
        if (u && (u.Color || u.color)) return u.Color || u.color;
        // deterministic hash-based color from identifier (Id, Email, Name)
        const key = u && (u.Id || u.Email || u.Name) ? String(u.Id || u.Email || u.Name) : '';
        const palette = ['#2563eb', '#0ea5e9', '#f97316', '#10b981', '#7c3aed', '#ef4444', '#06b6d4', '#f59e0b', '#a78bfa', '#7dd3fc'];
        if (!key) return palette[0];
        let hash = 0;
        for (let i = 0; i < key.length; i++) { hash = ((hash << 5) - hash) + key.charCodeAt(i); hash |= 0; }
        const idx = Math.abs(hash) % palette.length;
        return palette[idx];
    }

    getAssignedAvatarColor() {
        const u = this.users.find(x => x.Name === this.model.assignedTo);
        return this.getUserColor(u || {});
    }

    typeColorMap: Record<string,string> = {};
    getTypeColor(typeName: string){ return this.typeColorMap[typeName] || '#94a3b8'; }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        // if clicked inside assignee wrapper keep it open
        if (this.assigneeWrapper && this.assigneeWrapper.nativeElement.contains(target)) return;
        // if clicked inside discussion mention list keep it open
        if (this.discussionArea && this.discussionArea.nativeElement.contains(target)) return;
        // if clicked inside card area, keep panels as is; otherwise close all popovers and quick view
        if (!this.wicCard || !this.wicCard.nativeElement.contains(target)) {
            this.showAssigneeList = false;
            this.showLinkedPanel = false;
            this.showHistoryPanel = false;
            this.showAttachmentsPanel = false;
            this.showMentionList = false;
            this.activeTab = 'details';
        }
    }

    onDiscussionInput(event: any) {
        const ta: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
        const value = ta.value;
        const cursor = ta.selectionStart || 0;
        const atIndex = value.lastIndexOf('@', cursor - 1);
        if (atIndex === -1) {
            this.showMentionList = false;
            return;
        }
        // ensure '@' is start or preceded by whitespace
        if (atIndex > 0) {
            const before = value.charAt(atIndex - 1);
            if (before.trim() !== '') { this.showMentionList = false; return; }
        }
        const term = value.substring(atIndex + 1, cursor);
        this.mentionFilter = term;
        const q = (term || '').toLowerCase();
        this.mentionCandidates = this.users.filter(u => (u.Name || '').toLowerCase().includes(q));
        this.showMentionList = this.mentionCandidates.length > 0;
        this.mentionFocusedIndex = 0;
        this.mentionStartIndex = atIndex;
    }

    // contenteditable based discussion input handlers
    onDiscussionInputEditable(event: any) {
        const el = this.discussionArea?.nativeElement as HTMLElement;
        if (!el) return;
        const sel = window.getSelection && window.getSelection();
        if (!sel || sel.rangeCount === 0) { this.showMentionList = false; return; }
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset || 0;
        // only handle when inside a text node
        if (!node || node.nodeType !== Node.TEXT_NODE) { this.showMentionList = false; return; }
        const textNode = node as Text;
        const textUpToCursor = (textNode.textContent || '').slice(0, offset);
        const atIndex = textUpToCursor.lastIndexOf('@');
        if (atIndex === -1) { this.showMentionList = false; return; }
        if (atIndex > 0) {
            const before = textUpToCursor.charAt(atIndex - 1);
            if (before.trim() !== '') { this.showMentionList = false; return; }
        }
        const term = textUpToCursor.substring(atIndex + 1);
        this.mentionFilter = term;
        const q = (term || '').toLowerCase();
        this.mentionCandidates = this.users.filter(u => (u.Name || '').toLowerCase().includes(q));
        this.showMentionList = this.mentionCandidates.length > 0;
        this.mentionFocusedIndex = 0;
        this.mentionRange = { node: textNode, start: atIndex, end: offset };
    }

    onDiscussionKeydownEditable(event: KeyboardEvent) {
        if (!this.showMentionList) return;
        const list = this.mentionCandidates;
        if (!list || list.length === 0) return;
        if (event.key === 'ArrowDown') {
            this.mentionFocusedIndex = Math.min(this.mentionFocusedIndex + 1, list.length - 1);
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            this.mentionFocusedIndex = Math.max(this.mentionFocusedIndex - 1, 0);
            event.preventDefault();
        } else if (event.key === 'Enter') {
            const u = list[this.mentionFocusedIndex];
            if (u) { this.insertMentionEditable(u); }
            event.preventDefault();
        } else if (event.key === 'Escape') {
            this.showMentionList = false;
            event.preventDefault();
        }
    }

    insertMentionEditable(u: any) {
        const el = this.discussionArea?.nativeElement as HTMLElement;
        if (!el || !this.mentionRange) return;
        const textNode: Text = this.mentionRange.node as Text;
        const start = this.mentionRange.start;
        const end = this.mentionRange.end;
        const fullText = textNode.textContent || '';
        const beforeText = fullText.slice(0, start);
        const afterText = fullText.slice(end);

        const parent = textNode.parentNode as Node;
        const beforeNode = beforeText ? document.createTextNode(beforeText) : null;
        const afterNode = afterText ? document.createTextNode(afterText) : null;

        const span = document.createElement('span');
        span.className = 'mention';
        span.setAttribute('data-id', String(u.Id || ''));
        span.textContent = u.Name;
        // replace the original text node with before + mention + space + after
        const frag = document.createDocumentFragment();
        if (beforeNode) frag.appendChild(beforeNode);
        frag.appendChild(span);
        frag.appendChild(document.createTextNode(' '));
        if (afterNode) frag.appendChild(afterNode);
        parent.replaceChild(frag, textNode);

        // move caret after the inserted space
        const sel = window.getSelection && window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            const range = document.createRange();
            // set start after the span (which is now in DOM)
            const next = span.nextSibling;
            if (next) {
                range.setStart(next, 1);
            } else {
                range.setStartAfter(span);
            }
            range.collapse(true);
            sel.addRange(range);
        }

        // update model discussion with plain text (mentions remain as names)
        this.model.discussion = el.innerText || el.textContent || '';

        // reset mention state
        this.showMentionList = false;
        this.mentionCandidates = [];
        this.mentionRange = null;
        this.mentionFilter = '';
        this.onFieldChange('discussion', this.model.discussion);
    }

    onDiscussionKeydown(event: KeyboardEvent) {
        if (!this.showMentionList) return;
        const list = this.mentionCandidates;
        if (!list || list.length === 0) return;
        if (event.key === 'ArrowDown') {
            this.mentionFocusedIndex = Math.min(this.mentionFocusedIndex + 1, list.length - 1);
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            this.mentionFocusedIndex = Math.max(this.mentionFocusedIndex - 1, 0);
            event.preventDefault();
        } else if (event.key === 'Enter') {
            const u = list[this.mentionFocusedIndex];
            if (u) { this.insertMention(u); }
            event.preventDefault();
        } else if (event.key === 'Escape') {
            this.showMentionList = false;
            event.preventDefault();
        }
    }

    insertMention(u: any) {
        if (!this.discussionArea) return;
        const ta: any = this.discussionArea.nativeElement;
        const isTextarea = ta && ('value' in ta);
        const val = isTextarea ? String(ta.value || '') : String(ta.innerText || ta.textContent || '');
        const cursor = (isTextarea && 'selectionStart' in ta && ta.selectionStart) ? ta.selectionStart : val.length;
        const start = this.mentionStartIndex >= 0 ? this.mentionStartIndex : val.lastIndexOf('@', cursor - 1);
        if (start === -1) return;
        const before = val.substring(0, start);
        const after = val.substring(cursor);
        const insertText = '@' + u.Name + ' ';
        if (isTextarea) {
            const newVal = before + insertText + after;
            ta.value = newVal;
            this.model.discussion = newVal;
            // place cursor after inserted mention
            const pos = (before + insertText).length;
            setTimeout(() => { try { (ta as HTMLTextAreaElement).focus(); (ta as HTMLTextAreaElement).setSelectionRange(pos, pos); } catch (e) {} }, 0);
        } else {
            // fallback to contenteditable insertion helper
            this.insertMentionEditable(u);
            return;
        }
        this.showMentionList = false;
        this.mentionCandidates = [];
        this.mentionFilter = '';
        this.mentionStartIndex = -1;
        this.onFieldChange('discussion', this.model.discussion);
    }

    selectTab(tab: 'details' | 'linked' | 'history' | 'attachments' | 'git') {
        this.activeTab = tab;
    }

    // --- Git/PR helpers (demo-only, in-memory) ---
    createPR() {
        const git = this.model.git || {};
        if (!git.sourceBranch) { alert('Please enter source branch'); return; }
        const prId = Date.now() % 100000;
        const pr = {
            id: prId,
            title: git.prTitle || (`PR for ${this.model.title || git.sourceBranch}`),
            description: git.prDescription || '',
            status: 'Open',
            statusColor: 'Active',
            approvals: []
        };
        this.model.git.pr = pr;
        // ensure commits loaded
        if (!this.model.git.commits || this.model.git.commits.length === 0) this.fetchCommits();
        this.historyEntries.unshift({ ts: new Date(), user: 'You', field: 'git.pr', oldValue: '', newValue: `PR#${pr.id}` });
    }

    fetchCommits() {
        const git = this.model.git || {};
        // demo: generate 3 sample commits if empty
        if (!git.commits || git.commits.length === 0) {
            git.commits = [
                { sha: 'a1b2c3d', message: 'Initial commit for feature', author: 'Dev A', comments: [] },
                { sha: 'd4e5f6g', message: 'Refactor module', author: 'Dev B', comments: [] },
                { sha: 'h7i8j9k', message: 'Add tests', author: 'Dev A', comments: [] }
            ];
            this.model.git.commits = git.commits;
        }
    }

    addCommitComment(commitIndex: number) {
        const git = this.model.git || {};
        const commits = git.commits || [];
        if (!commits[commitIndex]) return;
        const c = commits[commitIndex];
        const text = (c.newComment || '').trim();
        if (!text) return;
        if (!c.comments) c.comments = [];
        c.comments.push({ author: 'You', text, ts: new Date() });
        c.newComment = '';
        this.historyEntries.unshift({ ts: new Date(), user: 'You', field: 'git.commit.comment', oldValue: '', newValue: text });
    }

    approvePR(user: string) {
        const git = this.model.git || {};
        if (!git.pr) return;
        git.pr.approvals = git.pr.approvals || [];
        if (!git.pr.approvals.includes(user)) git.pr.approvals.push(user);
        // update status
        if (git.pr.approvals.length >= (git.approvalsRequired || 1)) {
            git.pr.status = 'Approved';
            git.pr.statusColor = 'Resolved';
        }
        this.historyEntries.unshift({ ts: new Date(), user, field: 'git.pr.approve', oldValue: '', newValue: `approved by ${user}` });
    }

    // Extract mention metadata from contenteditable discussion element
    private extractMentionsFromEditor(el: HTMLElement) {
        const mentions: any[] = [];
        const spans = el.querySelectorAll('span.mention');
        spans.forEach(s => {
            const id = s.getAttribute('data-id');
            const name = s.textContent || '';
            mentions.push({ id: id ? Number(id) : null, name });
        });
        return mentions;
    }

    addDiscussion() {
        const el = this.discussionArea?.nativeElement as HTMLElement;
        if (!el) return;
        const html = el.innerHTML.trim();
        const text = el.innerText.trim();
        if (!text) return; // nothing to add
        const mentions = this.extractMentionsFromEditor(el);
        const entry = { id: Date.now(), author: 'You', html, text, mentions, ts: new Date() };
        if (!this.model.discussions) this.model.discussions = [];
        this.model.discussions.unshift(entry);
        this.historyEntries.unshift({ ts: new Date(), user: 'You', field: 'discussion', oldValue: '', newValue: text });
        // clear editor
        el.innerHTML = '';
        this.showMentionList = false;
        this.mentionCandidates = [];
        this.mentionRange = null;
        this.mentionFilter = '';
        this.model.discussion = '';
        this.onFieldChange('discussions', JSON.stringify(this.model.discussions));
    }

    toggleLinkedPanel() {
        this.activeTab = this.activeTab === 'linked' ? 'details' : 'linked';
    }

    toggleHistoryPanel() {
        this.activeTab = this.activeTab === 'history' ? 'details' : 'history';
    }

    toggleAttachmentsPanel() {
        this.activeTab = this.activeTab === 'attachments' ? 'details' : 'attachments';
    }

    submit() {
        this.validatePlanDates();
        this.validateActualDates();
        if (this.hasErrors()) {
            alert('Please fix validation errors before saving.');
            return;
        }
        // TODO: hook up to backend or service
        console.log('Create work item', this.model);
        alert('Work item created (demo): ' + this.model.title);
        this.reset();
    }

    reset() {
        this.model = { title: '', assignedTo: '', state: 'New', tags: '', description: '', discussion: '', mentions: [] };
        // clear contenteditable discussion input if present
        if (this.discussionArea && this.discussionArea.nativeElement) {
            this.discussionArea.nativeElement.innerHTML = '';
        }
    }

    cancel() {
        this.reset();
    }
}
