# revert 与 cherry-pick

与人谈起了版本恢复，除了 reset --hard，还有 revert 能进行版本回退，之前都没听说过

### 用法

git revert -n \<commit_hash\>

用来在当前版本中删除某次提交的提交信息，只会处理指定的commit，其它的commit会保留。个人觉得本质上就是在当前版本上进行文件修改，比较容易造成冲突

### cherry-pick

尝试了revert命令后，感觉就是 cherry-pick 的逆操作，cherry-pick 是将某个commit 加到当前分支

git cherry-pick \<commit_hash\>

### 大胆的想法

没试验过，不知道是否可行

如果需要revert多个连续的commit这么办，可以使用rebase将多个commit 合成一个，再回退到之前的commit,避免对历史的commit造成影响，然后再使用revert 针对合并后的commit做撤销操作，不知道是否可行